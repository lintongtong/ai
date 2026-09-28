#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
台股選股工作台｜資料抓取腳本
================================
從官方公開資料抓全市場（上市＋上櫃普通股）資料，輸出一個 stocks.json，
再到「台股選股工作台」網頁按「載入資料檔」選這個檔案即可。

資料來源
- 每日收盤行情：臺灣證券交易所 MI_INDEX、櫃買中心 dailyQuotes
- 三大法人買賣超：證交所 T86、櫃買中心 insti/dailyTrade
- 本益比／殖利率／股價淨值比：證交所 BWIBBU_d、櫃買中心 peQryDate
- 月營收：公開資訊觀測站 t21sc03 彙總檔（上市 sii、上櫃 otc）

使用方式（需要 Python 3.9 以上，不用另外安裝套件）
    python fetch_tw_stocks.py                 # 預設抓近 260 個交易日（約一年）
    python fetch_tw_stocks.py --days 120      # 只抓近 120 個交易日，比較快
    python fetch_tw_stocks.py --out D:/stock/stocks.json

注意
- 第一次執行要逐日抓一年資料，為避免被證交所暫時封鎖，每次請求間隔約 3 秒，
  約需 40～60 分鐘。抓過的日期會存在 .twcache 資料夾，之後每天再跑只補新的，1～2 分鐘。
- 建議平日下午 16:30 後執行（三大法人資料約 16:00 後公布）。
- 官方網站偶爾改版或變更欄位名稱；若某一段抓取失敗，腳本會印出警告並略過，
  其餘資料照常輸出。
"""

import argparse
import csv
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

SLEEP = 3.0
CACHE_DIR = ".twcache"
DEADLINE = None      # 超過就不再連網，只用已抓到的資料輸出
OFFLINE = False      # 連續失敗太多次時設為 True
FAILS = 0
REQS = 0
BENCH_CODE = "0050"


# ---------------------------------------------------------------- 工具函式

def log(msg):
    print(msg, flush=True)


def num(s):
    """把官方表格的文字轉成數字；'--'、''、'X' 等無效值回傳 None。"""
    if s is None:
        return None
    if isinstance(s, (int, float)):
        return float(s)
    s = str(s).strip().replace(",", "").replace("+", "")
    s = re.sub(r"<[^>]+>", "", s)  # 去掉 HTML 標籤（漲跌欄位會有）
    if s in ("", "-", "--", "---", "N/A", "X", "除權息", "除權", "除息"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def roc(d):
    return d.year - 1911


def out_of_time(reserve=0):
    return DEADLINE is not None and time.time() > DEADLINE - reserve


def http_get(url, binary=False, retries=3):
    global FAILS, OFFLINE, REQS
    if OFFLINE or out_of_time():
        return None
    last = None
    for i in range(retries):
        REQS += 1
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=40) as r:
                data = r.read()
            time.sleep(SLEEP)
            FAILS = 0
            return data if binary else data.decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            last = e
            if e.code == 404:
                time.sleep(SLEEP)
                return None
        except Exception as e:  # 連線被斷、逾時等
            last = e
        if i == retries - 1:
            break
        wait = (10, 30, 60)[min(i, 2)]
        log(f"    ⚠ 請求失敗（{last}），{wait} 秒後重試…")
        time.sleep(wait)
    FAILS += 1
    log(f"    ✗ 放棄：{url}")
    if FAILS >= 6:
        OFFLINE = True
        log("    ✗ 連續 6 次請求失敗，可能被暫時封鎖：停止連線，改用已抓到的資料輸出")
    return None


def get_json(url):
    txt = http_get(url)
    if not txt:
        return None
    try:
        return json.loads(txt)
    except json.JSONDecodeError:
        # 被暫時封鎖時證交所會回傳 HTML
        log("    ⚠ 回應不是 JSON（可能請求太頻繁），暫停 30 秒…")
        time.sleep(30)
        txt = http_get(url)
        try:
            return json.loads(txt) if txt else None
        except json.JSONDecodeError:
            return None


def cached(kind, key, fetch, cache_empty):
    """以檔案快取官方回應。cache_empty=False 時，空結果不寫快取（例如今天資料還沒出來）。"""
    path = os.path.join(CACHE_DIR, kind, f"{key}.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    data = fetch()
    if data is None:
        return None  # 網路失敗，不快取
    if data or cache_empty:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
    return data


def find_table(js, must):
    """官方 JSON 可能是 {tables:[{fields,data}]} 或 {fields,data} 或 {aaData}；找出欄位包含 must 的表。"""
    if not isinstance(js, dict):
        return None, None
    cands = []
    if isinstance(js.get("tables"), list):
        cands.extend(js["tables"])
    cands.append(js)
    for t in cands:
        if not isinstance(t, dict):
            continue
        fields = t.get("fields") or t.get("fields9")
        data = t.get("data") or t.get("data9") or t.get("aaData")
        if not fields or not data:
            continue
        clean = [re.sub(r"\s+", "", str(f)) for f in fields]
        if all(any(m in f for f in clean) for m in must):
            return clean, data
    return None, None


def col(fields, *names, exclude=()):
    """回傳第一個名稱符合的欄位索引。names 內每個條件可為字串或 tuple（全部都要包含）。"""
    for n in names:
        parts = n if isinstance(n, tuple) else (n,)
        for i, f in enumerate(fields):
            if all(p in f for p in parts) and not any(x in f for x in exclude):
                return i
    return None


def is_stock(code):
    return bool(re.fullmatch(r"[1-9]\d{3}", code))


# ---------------------------------------------------------------- 每日行情

def twse_quotes(d):
    js = get_json("https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX"
                  f"?date={d:%Y%m%d}&type=ALLBUT0999&response=json")
    if js is None:
        return None
    fields, rows = find_table(js, ["證券代號", "收盤價"])
    if not fields:
        return {}
    ic, iname = col(fields, "證券代號"), col(fields, "證券名稱")
    iclose, ivol = col(fields, "收盤價"), col(fields, "成交股數")
    out = {}
    for r in rows:
        code = str(r[ic]).strip()
        out[code] = [str(r[iname]).strip(), num(r[iclose]), num(r[ivol])]
    return out


def tpex_quotes(d):
    urls = [
        f"https://www.tpex.org.tw/www/zh-tw/afterTrading/dailyQuotes?date={d:%Y/%m/%d}&id=&response=json",
        f"https://www.tpex.org.tw/www/zh-tw/afterTrading/dailyQuotes?date={roc(d)}/{d:%m/%d}&id=&response=json",
    ]
    for u in urls:
        js = get_json(u)
        if js is None:
            continue
        fields, rows = find_table(js, ["代號", "收盤"])
        if not fields:
            continue
        ic = col(fields, "代號")
        iname = col(fields, "名稱")
        iclose = col(fields, "收盤")
        ivol = col(fields, "成交股數", ("成交", "股"))
        out = {}
        for r in rows:
            code = str(r[ic]).strip()
            out[code] = [str(r[iname]).strip(), num(r[iclose]), num(r[ivol]) if ivol is not None else None]
        return out
    return {}


# ---------------------------------------------------------------- 三大法人

def _inst_cols(fields):
    i_for = col(fields, ("外陸資", "買賣超"), ("外資及陸資", "買賣超"), ("外資", "買賣超"),
                exclude=("外資自營商買", "外資自營商賣"))
    i_tru = col(fields, ("投信", "買賣超"))
    return i_for, i_tru


def twse_inst(d):
    js = get_json("https://www.twse.com.tw/rwd/zh/fund/T86"
                  f"?date={d:%Y%m%d}&selectType=ALLBUT0999&response=json")
    if js is None:
        return None
    fields, rows = find_table(js, ["證券代號", "買賣超"])
    if not fields:
        return {}
    ic = col(fields, "證券代號")
    i_for, i_tru = _inst_cols(fields)
    return {str(r[ic]).strip(): [num(r[i_for]) if i_for is not None else None,
                                 num(r[i_tru]) if i_tru is not None else None] for r in rows}


def tpex_inst(d):
    urls = [
        f"https://www.tpex.org.tw/www/zh-tw/insti/dailyTrade?type=Daily&sect=EW&date={d:%Y/%m/%d}&response=json",
        f"https://www.tpex.org.tw/www/zh-tw/insti/dailyTrade?type=Daily&sect=EW&date={roc(d)}/{d:%m/%d}&response=json",
    ]
    for u in urls:
        js = get_json(u)
        if js is None:
            continue
        fields, rows = find_table(js, ["代號", "買賣超"])
        if not fields:
            continue
        ic = col(fields, "代號")
        i_for, i_tru = _inst_cols(fields)
        return {str(r[ic]).strip(): [num(r[i_for]) if i_for is not None else None,
                                     num(r[i_tru]) if i_tru is not None else None] for r in rows}
    return {}


# ---------------------------------------------------------------- 評價（本益比等）

def _val_parse(js, code_names):
    fields, rows = find_table(js, ["本益比"])
    if not fields:
        return {}
    ic = col(fields, *code_names)
    ipe, idy, ipb = col(fields, "本益比"), col(fields, "殖利率"), col(fields, "股價淨值比")
    return {str(r[ic]).strip(): [num(r[ipe]), num(r[idy]), num(r[ipb])] for r in rows}


def twse_val(d):
    js = get_json("https://www.twse.com.tw/rwd/zh/afterTrading/BWIBBU_d"
                  f"?date={d:%Y%m%d}&selectType=ALL&response=json")
    return None if js is None else _val_parse(js, ["證券代號"])


def tpex_val(d):
    for u in [f"https://www.tpex.org.tw/www/zh-tw/afterTrading/peQryDate?date={d:%Y/%m/%d}&response=json",
              f"https://www.tpex.org.tw/www/zh-tw/afterTrading/peQryDate?date={roc(d)}/{d:%m/%d}&response=json"]:
        js = get_json(u)
        if js is None:
            continue
        out = _val_parse(js, ["股票代號", "代號"])
        if out:
            return out
    return {}


# ---------------------------------------------------------------- 月營收

def mops_revenue(y, m, market):
    """market: sii（上市）或 otc（上櫃）。回傳 {code: [產業別, 當月營收(千元), 年增率%]}"""
    ry = y - 1911
    for host in ("https://mopsov.twse.com.tw", "https://mops.twse.com.tw"):
        raw = http_get(f"{host}/nas/t21/{market}/t21sc03_{ry}_{m}_0.csv", binary=True)
        if not raw:
            continue
        txt = None
        for enc in ("utf-8-sig", "cp950", "big5"):
            try:
                txt = raw.decode(enc)
                break
            except UnicodeDecodeError:
                continue
        if not txt or "公司代號" not in txt:
            continue
        rd = csv.reader(io.StringIO(txt))
        header = [re.sub(r"\s+", "", h) for h in next(rd)]
        ic = col(header, "公司代號")
        iind = col(header, "產業別")
        irev = col(header, ("當月營收",), exclude=("上月", "去年", "累計"))
        iyoy = col(header, ("去年同月增減",), exclude=("累計",))
        out = {}
        for r in rd:
            if len(r) <= max(ic, irev, iyoy):
                continue
            code = r[ic].strip()
            out[code] = [r[iind].strip() if iind is not None else "",
                         num(r[irev]), num(r[iyoy])]
        return out
    return None


# ---------------------------------------------------------------- 主流程

def main():
    global SLEEP, CACHE_DIR
    ap = argparse.ArgumentParser(description="抓取台股全市場資料，輸出給「台股選股工作台」使用")
    ap.add_argument("--days", type=int, default=260, help="抓取的交易日數（預設 260，約一年）")
    ap.add_argument("--out", default="stocks.json", help="輸出檔名（預設 stocks.json）")
    ap.add_argument("--cache", default=".twcache", help="快取資料夾")
    ap.add_argument("--sleep", type=float, default=3.0, help="每次請求間隔秒數（預設 3）")
    ap.add_argument("--max-minutes", type=float, default=0, help="最多花幾分鐘連網抓資料（0＝不限）；到時間就用已抓到的資料輸出")
    args = ap.parse_args()
    global DEADLINE
    SLEEP, CACHE_DIR = args.sleep, args.cache
    if args.max_minutes > 0:
        DEADLINE = time.time() + args.max_minutes * 60

    today = date.today()
    now = datetime.now()

    # 1) 從最近一天往回，逐日抓行情＋法人（時間不夠或被擋時，保留已抓到的最近 N 天）
    log(f"① 抓每日行情與三大法人（目標 {args.days} 個交易日，時間上限 {args.max_minutes} 分鐘）")
    RESERVE = 12 * 60  # 保留給評價與月營收
    day_tables = {}
    d = today
    scanned = 0
    t0 = time.time()
    while len(day_tables) < args.days and scanned < args.days * 2 + 30:
        scanned += 1
        if d.weekday() < 5:
            key = f"{d:%Y%m%d}"
            if (OFFLINE or out_of_time(RESERVE)) and not os.path.exists(os.path.join(CACHE_DIR, "tpex_i", f"{key}.json")):
                log(f"  ⏹ 停止往回抓（{'連線被擋' if OFFLINE else '已達時間上限'}），共取得 {len(day_tables)} 個交易日；下次執行會從快取接著抓")
                break
            final = d < today or now.hour >= 17
            tw = cached("twse_q", key, lambda d=d: twse_quotes(d), cache_empty=final)
            if tw:
                tp = cached("tpex_q", key, lambda d=d: tpex_quotes(d), final) or {}
                ti = cached("twse_i", key, lambda d=d: twse_inst(d), final) or {}
                pi = cached("tpex_i", key, lambda d=d: tpex_inst(d), final) or {}
                day_tables[d] = (tw, tp, ti, pi)
                k = len(day_tables)
                if k <= 3 or k % 10 == 0:
                    log(f"  {d}  上市 {len(tw)}・上櫃 {len(tp)}・法人 {len(ti) + len(pi)} 筆"
                        f"（第 {k} 天，已用 {(time.time() - t0) / 60:.0f} 分鐘，累計請求 {REQS} 次）")
        d -= timedelta(days=1)
    trade_days = sorted(day_tables)
    if len(trade_days) < 25:
        log(f"✗ 只取得 {len(trade_days)} 個交易日，不足以輸出（至少需要 25 天）。請稍後再試或改在自己電腦執行。")
        sys.exit(1)

    dates = [f"{d:%Y-%m-%d}" for d in trade_days]
    n = len(dates)
    stocks = {}   # code -> dict
    bench = [None] * n

    def ensure(code, name, market):
        s = stocks.get(code)
        if s is None:
            s = stocks[code] = {"c": code, "n": name, "m": market, "ind": "",
                                "cl": [None] * n, "vo": [None] * n,
                                "fb": [None] * n, "tb": [None] * n}
        elif name:
            s["n"] = name  # 以最新名稱為準
        return s

    for i, d in enumerate(trade_days):
        tw, tp, ti, pi = day_tables[d]
        for market, table in (("上市", tw), ("上櫃", tp)):
            for code, (name, close, vol) in table.items():
                if code == BENCH_CODE:
                    bench[i] = close
                if not is_stock(code):
                    continue
                s = ensure(code, name, market)
                s["cl"][i] = close
                s["vo"][i] = round(vol / 1000) if vol is not None else None
        for table in (ti, pi):
            for code, (fb, tb) in table.items():
                s = stocks.get(code)
                if not s:
                    continue
                s["fb"][i] = round(fb / 1000) if fb is not None else None
                s["tb"][i] = round(tb / 1000) if tb is not None else None
    log(f"  完成：{dates[0]} ～ {dates[-1]}，{n} 個交易日，{len(stocks)} 檔")

    # 2) 評價：每月第一個交易日 + 最新一天
    log("② 抓本益比／殖利率／股價淨值比（每月一次＋最新）")
    val_idx = []
    seen_month = set()
    for i, d in enumerate(trade_days):
        ym = (d.year, d.month)
        if ym not in seen_month:
            seen_month.add(ym)
            val_idx.append(i)
    if val_idx[-1] != n - 1:
        val_idx.append(n - 1)
    for s in stocks.values():
        s["pe"], s["dy"], s["pb"] = [None] * len(val_idx), [None] * len(val_idx), [None] * len(val_idx)
    for k, i in enumerate(val_idx):
        d = trade_days[i]
        key = f"{d:%Y%m%d}"
        final = d < today or now.hour >= 17
        for kind, fn in (("twse_v", twse_val), ("tpex_v", tpex_val)):
            table = cached(kind, key, lambda d=d, fn=fn: fn(d), final) or {}
            for code, (pe, dy, pb) in table.items():
                s = stocks.get(code)
                if s:
                    s["pe"][k], s["dy"][k], s["pb"][k] = pe, dy, pb
        log(f"  {d}")

    # 3) 月營收：涵蓋資料期間＋前 3 個月
    log("③ 抓月營收")
    first = trade_days[0]
    y, m = first.year, first.month
    for _ in range(3):
        m -= 1
        if m == 0:
            y, m = y - 1, 12
    months = []
    while (y, m) < (today.year, today.month):
        months.append((y, m))
        m += 1
        if m == 13:
            y, m = y + 1, 1
    rev_months = []
    rev_data = []
    for (y, m) in months:
        # 當月營收在次月 10 日前公布；還沒到公布期的月份不快取空結果
        pub = date(y + (m == 12), 1 if m == 12 else m + 1, 11)
        merged = {}
        for mk in ("sii", "otc"):
            t = cached("rev", f"{y}{m:02d}_{mk}", lambda y=y, m=m, mk=mk: mops_revenue(y, m, mk) or {},
                       cache_empty=today >= pub)
            merged.update(t or {})
        if merged:
            rev_months.append(f"{y}-{m:02d}")
            rev_data.append(merged)
            log(f"  {y}-{m:02d}  {len(merged)} 家")
        else:
            log(f"  {y}-{m:02d}  尚無資料，略過")
    for s in stocks.values():
        s["rv"] = [None] * len(rev_months)
        s["ry"] = [None] * len(rev_months)
    for k, table in enumerate(rev_data):
        for code, (ind, rv, ry) in table.items():
            s = stocks.get(code)
            if not s:
                continue
            if ind:
                s["ind"] = ind
            s["rv"][k] = rv
            s["ry"][k] = ry

    # 4) 輸出
    out_stocks = []
    for code in sorted(stocks):
        s = stocks[code]
        if s["cl"][-1] is None and all(v is None for v in s["cl"][-20:]):
            continue  # 近期沒有交易（下市、全額交割等）
        for key in ("cl",):
            s[key] = [round(v, 2) if v is not None else None for v in s[key]]
        out_stocks.append(s)

    result = {
        "v": 1,
        "demo": False,
        "generated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "source": "臺灣證券交易所、證券櫃檯買賣中心、公開資訊觀測站",
        "dates": dates,
        "valIdx": val_idx,
        "months": rev_months,
        "bench": {"code": BENCH_CODE, "name": "元大台灣50", "cl": bench},
        "stocks": out_stocks,
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, separators=(",", ":"))
    size = os.path.getsize(args.out) / 1024 / 1024
    if OFFLINE or out_of_time():
        log("  ⚠ 本次有部分資料因時間上限或連線被擋而缺漏，下次執行會自動補齊")
    log(f"\n✓ 完成：{args.out}（{len(out_stocks)} 檔，{dates[0]} ～ {dates[-1]}，{size:.1f} MB）")
    log("  到「台股選股工作台」網頁按「載入資料檔」選這個檔案即可。")


if __name__ == "__main__":
    main()

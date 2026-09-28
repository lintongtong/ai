# 暫時用的診斷腳本：檢查櫃買法人與月營收來源的實際回應格式
import json, urllib.request, time
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
urls = [
 "https://www.tpex.org.tw/www/zh-tw/insti/dailyTrade?type=Daily&sect=EW&date=2026/09/24&response=json",
 "https://www.tpex.org.tw/www/zh-tw/insti/dailyTrade?type=Daily&sect=AL&date=2026/09/24&response=json",
 "https://www.tpex.org.tw/www/zh-tw/insti/dailyTrade?type=Daily&sect=EW&date=115/09/24&response=json",
 "https://mopsov.twse.com.tw/nas/t21/sii/t21sc03_115_8_0.csv",
 "https://mops.twse.com.tw/nas/t21/sii/t21sc03_115_8_0.csv",
 "https://mopsov.twse.com.tw/nas/t21/sii/t21sc03_115_8_0.html",
 "https://mopsov.twse.com.tw/nas/t21/otc/t21sc03_115_8_0.csv",
 "https://openapi.twse.com.tw/v1/opendata/t187ap05_L",
 "https://www.tpex.org.tw/openapi/v1/mopsfe_t187ap05_O",
 "https://openapi.twse.com.tw/v1/opendata/t187ap03_L",
 "https://www.tpex.org.tw/openapi/v1/mopsfe_t187ap03_O",
]
out = []
for u in urls:
    out.append("=" * 100 + "\n" + u)
    try:
        req = urllib.request.Request(u, headers={"User-Agent": UA, "Accept": "*/*"})
        with urllib.request.urlopen(req, timeout=40) as r:
            b = r.read(); out.append(f"status {r.status} type {r.headers.get('Content-Type')} bytes {len(b)}")
        txt = None
        for enc in ("utf-8-sig", "cp950"):
            try: txt = b.decode(enc); out.append("enc " + enc); break
            except UnicodeDecodeError: pass
        try:
            js = json.loads(txt)
            if isinstance(js, dict):
                out.append("keys " + str(list(js.keys())))
                for k, v in js.items():
                    if k == "tables":
                        for i, t in enumerate(v):
                            out.append(f" table[{i}] title={t.get('title')} fields={t.get('fields')} n={len(t.get('data') or [])}")
                            for row in (t.get('data') or [])[:2]: out.append("   " + json.dumps(row, ensure_ascii=False))
                    elif isinstance(v, list):
                        out.append(f" {k}: list n={len(v)} first={json.dumps(v[:2], ensure_ascii=False)[:600]}")
                    else:
                        out.append(f" {k}: {str(v)[:200]}")
            else:
                out.append(f"list n={len(js)} first={json.dumps(js[:2], ensure_ascii=False)[:1200]}")
        except Exception:
            out.append((txt or "")[:1500])
    except Exception as e:
        out.append("ERROR " + repr(e))
    time.sleep(3)
open("probe.txt", "w", encoding="utf-8").write("\n".join(out))
print("\n".join(out))

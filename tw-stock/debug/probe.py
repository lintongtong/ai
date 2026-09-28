# 暫時用的診斷腳本（第 2 輪）：月營收下載方式
import urllib.request, urllib.parse, time, re
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
out = []
def get(u, data=None):
    req = urllib.request.Request(u, data=data, headers={"User-Agent": UA, "Accept": "*/*",
        **({"Content-Type": "application/x-www-form-urlencoded", "Referer": "https://mopsov.twse.com.tw/nas/t21/sii/t21sc03_115_8_0.html"} if data else {})})
    with urllib.request.urlopen(req, timeout=40) as r:
        b = r.read(); return r.status, r.headers.get("Content-Type"), b
def dec(b):
    for enc in ("utf-8-sig", "cp950", "big5hkscs"):
        try: return enc, b.decode(enc)
        except UnicodeDecodeError: pass
    return "latin1", b.decode("latin1")
for host in ("https://mopsov.twse.com.tw", "https://mops.twse.com.tw"):
    for mk, fn in (("sii", "t21sc03_115_8.csv"), ("otc", "t21sc03_115_8.csv"), ("sii", "t21sc03_114_6.csv")):
        u = host + "/server-java/FileDownLoad"
        out.append("=" * 90 + f"\nPOST {u} {mk} {fn}")
        try:
            data = urllib.parse.urlencode({"step": "9", "functionName": "show_file2", "filePath": f"/t21/{mk}/", "fileName": fn}).encode()
            st, ct, b = get(u, data); enc, t = dec(b)
            out.append(f"status {st} {ct} bytes {len(b)} enc {enc}\n" + t[:900])
        except Exception as e: out.append("ERROR " + repr(e))
        time.sleep(3)
for u in ("https://mopsov.twse.com.tw/nas/t21/otc/t21sc03_115_8_0.html", "https://mopsov.twse.com.tw/nas/t21/sii/t21sc03_114_6_0.html", "https://mopsov.twse.com.tw/nas/t21/sii/t21sc03_115_8_0.html"):
    out.append("=" * 90 + "\nGET " + u)
    try:
        st, ct, b = get(u); enc, t = dec(b)
        out.append(f"status {st} {ct} bytes {len(b)} enc {enc}")
        i = t.find("產業別")
        out.append("--- around 產業別:\n" + t[max(0, i-300):i+2600])
        rows = re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S)
        out.append(f"--- tr count {len(rows)}; sample rows:")
        for r in rows[5:12] + rows[-4:]:
            cells = [re.sub(r"<[^>]+>|&nbsp;", "", c).strip() for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", r, re.S)]
            out.append("   " + " | ".join(cells))
    except Exception as e: out.append("ERROR " + repr(e))
    time.sleep(3)
open("probe.txt", "w", encoding="utf-8").write("\n".join(out)); print("\n".join(out))

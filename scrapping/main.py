import json
from playwright.sync_api import sync_playwright


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        url = "https://defillama.com/yields/strategy?lend=USDC&borrow=&chain=Gnosis&farmProtocol=&lendingProtocol=All"
        page.goto(url, wait_until="networkidle")
        page.wait_for_selector("#table-wrapper > div:nth-child(3)", timeout=15000)

        # Get headers
        header_cells = page.query_selector_all("#table-header > div > div")
        headers = []
        for cell in header_cells:
            span = cell.query_selector("span")
            button = span.query_selector("button") if span else None
            text = (button or span).inner_text().strip() if (button or span) else ""
            headers.append(text)

        # Get rows
        table_div = page.query_selector("#table-wrapper > div:nth-child(3)")
        rows = table_div.query_selector_all(":scope > div") if table_div else []

        data = []
        for row in rows:
            row_cells = row.query_selector_all(":scope > div")
            row_data = {}
            for j, cell in enumerate(row_cells):
                text = cell.inner_text().strip()
                key = headers[j] if j < len(headers) else f"col_{j}"
                row_data[key] = text
            data.append(row_data)

        browser.close()

        # Output as JSON
        print(json.dumps(data, indent=2))


if __name__ == "__main__":
    run()

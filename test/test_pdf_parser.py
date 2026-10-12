from pathlib import Path

from app.parsers.pdf_parser import extract_text_from_pdf


def test_extract_text_from_pdf():
    pdf_path = Path("test/sample_resume.pdf")

    text = extract_text_from_pdf(pdf_path)

    assert text is not None
    assert len(text.strip()) > 0
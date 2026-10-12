from pathlib import Path

from app.parsers.docx_parser import extract_text_from_docx


def test_extract_text_from_docx():
    docx_path = Path("test/sample_resume.docx")

    text = extract_text_from_docx(docx_path)

    assert text is not None
    assert len(text.strip()) > 0
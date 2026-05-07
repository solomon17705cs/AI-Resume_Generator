import pdfplumber
from docx import Document
import io

def extract_text_from_pdf(file_bytes):
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error parsing PDF: {e}")
    return text

def extract_text_from_docx(file_bytes):
    text = ""
    try:
        doc = Document(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error parsing DOCX: {e}")
    return text

def parse_resume_to_text(file_bytes, filename):
    extension = filename.split('.')[-1].lower()
    
    if extension == 'pdf':
        return extract_text_from_pdf(file_bytes)
    elif extension in ['docx', 'doc']:
        return extract_text_from_docx(file_bytes)
    elif extension == 'txt':
        return file_bytes.decode('utf-8', errors='ignore')
    else:
        return "Unsupported file format"

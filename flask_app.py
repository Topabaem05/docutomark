import os
import secrets  
from flask import Flask, request, render_template, redirect, url_for, flash, session, Response  # session, Response 추가
from werkzeug.utils import secure_filename
from markitdown import MarkItDown

# OCR을 위해 추가
import pytesseract
from PIL import Image
from dotenv import load_dotenv

# .env 파일에 설정된 환경 변수 로드
load_dotenv()

app = Flask(__name__)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {
    'pdf', 'docx', 'xlsx', 'pptx',
    'html', 'csv', 'json', 'xml', 'zip'
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        flash('파일이 선택되지 않았습니다.')
        return redirect(request.url)
    
    file = request.files['file']
    
    if file.filename == '':
        flash('파일이 선택되지 않았습니다.')
        return redirect(request.url)
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)  # 서버에 파일 저장

        try:
            markitdown = MarkItDown()
            ext = filename.rsplit('.', 1)[1].lower()

            if ext in ('jpg', 'jpeg', 'png'):
                # 이미지 파일 -> OCR 처리 후 텍스트를 Markdown으로 변환
                ocr_text = pytesseract.image_to_string(Image.open(file_path))
                # 문자열(텍스트)을 바로 마크다운으로 변환
                result = markitdown.convert_string(ocr_text)
                markdown_content = result.text_content
            else:
                # 그 외 파일은 기존처럼 MarkItDown으로 변환
                result = markitdown.convert(file_path)
                markdown_content = result.text_content

            ### 변경점: 세션에 저장
            session['markdown_content'] = markdown_content

        except Exception as e:
            flash(f'파일 변환 중 오류가 발생했습니다: {e}')
            return redirect(url_for('index'))
        finally:
            # 변환/처리가 끝난 후 업로드된 파일 삭제
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # 변환된 Markdown 결과를 렌더링
        return render_template('result.html', content=markdown_content)
    else:
        flash('허용되지 않은 파일 형식입니다.')
        return redirect(request.url)

### 변경점: 다운로드 라우트 추가
@app.route('/download_markdown')
def download_markdown():
    # 세션에서 Markdown 내용 가져오기
    markdown_data = session.get('markdown_content', '')
    # 파일로 응답 (attachment)
    return Response(
        markdown_data,
        mimetype='text/markdown',
        headers={
            "Content-Disposition": "attachment; filename=converted.md"
        }
    )

if __name__ == '__main__':
    app.run(debug=True)
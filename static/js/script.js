// script.js
document.addEventListener('DOMContentLoaded', () => {
    const content = "쉽고 빠르고 간편하게 MarkDown으로 변환해봐요!";
    const text = document.querySelector(".text");
    let i = 0;
    
    function typing(){
        if (i < content.length) {
            let txt = content.charAt(i);
            text.innerHTML += txt;
            i++;
        }
    }
    setInterval(typing, 110);
      
    
    const textarea = document.querySelector('textarea');
    const fileInput = document.getElementById('file-input');
    const collaborationArea = document.querySelector('.collaboration-area');
    const filePreview = document.querySelector('.file-preview');
    const imagePreview = document.getElementById('image-preview');
    const documentPreview = document.getElementById('document-preview');
    const dropZone = document.getElementById('drop-zone');
    const submitButton = document.querySelector('.submit-button');
    const chatWindows = document.getElementById('chat-windows');

    let currentFile = null;

    // 텍스트 영역 자동 높이 조절
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // 파일 처리 함수
    function handleFile(file) {
        currentFile = file;
        if (file) {
            collaborationArea.style.display = 'none';
            filePreview.style.display = 'block';
            submitButton.disabled = false;
            submitButton.style.display = 'inline-block';

            if (file.type && file.type.startsWith('image/')) {
                imagePreview.style.display = 'block';
                documentPreview.style.display = 'none';
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (imagePreview) {
                        imagePreview.src = e.target.result;
                    }
                };
                reader.onerror = function(error) {
                    console.error("Error reading image file:", error);
                    imagePreview.style.display = 'none';
                    documentPreview.style.display = 'block';
                    documentPreview.textContent = "이미지 로딩 실패";
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.style.display = 'none';
                documentPreview.style.display = 'block';
                documentPreview.textContent = file.name;
            }
        } else {
            collaborationArea.style.display = 'block';
            filePreview.style.display = 'none';
            submitButton.disabled = true;
            submitButton.style.display = 'none';
        }
    }

    // 파일 입력 변경 시 처리
    fileInput.addEventListener('change', function(e) {
        handleFile(e.target.files[0]);
    });

    // Drag & Drop 기능
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.add('drag-active');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-active');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-active');
        
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    // **닫기 버튼 기능 추가**
    const closePreviewBtn = document.getElementById('close-preview-label');

    if (closePreviewBtn) { // 닫기 버튼이 존재할 경우에만 이벤트 리스너 추가
        closePreviewBtn.addEventListener('click', function() {
            // 현재 선택된 파일 초기화
            currentFile = null;
            
            // 미리보기 영역 숨기고, 협업 영역 다시 표시
            filePreview.style.display = 'none';
            collaborationArea.style.display = 'block';
            
            // 이미지, 문서 미리보기도 비활성화 또는 초기화
            if (imagePreview) {
                imagePreview.style.display = 'none';
                imagePreview.src = '';
            }
            if (documentPreview) {
                documentPreview.style.display = 'none';
                documentPreview.textContent = '';
            }

            // 제출 버튼 비활성화
            submitButton.disabled = true;
            submitButton.style.display = 'none';

            // 파일 입력 필드도 초기화
            if (fileInput) {
                fileInput.value = '';
            }
        });
    }
});
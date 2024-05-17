# 프로젝트명 (Project Name)

기본적인 온라인 상점 백엔드 CRUD 구현

## 기능 (Features)

| 설명               | METHOD |           URL |
| ------------------ | :----: | ------------: |
| 상품 생성 (C)      |  POST  |     /products |
| 상품 목록 조회 (R) |  GET   |     /products |
| 상품 상세 조회 (R) |  GET   | /products/:id |
| 상품 수정 (U)      |  PUT   | /products/:id |
| 상품 삭제 (D)      | DELETE | /products/:id |

## 설치 방법 (Installation)

1. 레포지토리를 클론합니다.
   git clone https://github.com/lunaradio24/backend-shop.git

2. 프로젝트 폴더로 이동합니다.
   cd backend-shop

3. 필요한 패키지를 설치합니다.
   npm install -g yarn
   yarn

## 사용 방법 (Usage)

1. 설정 파일을 수정합니다.
   .env 파일을 생성합니다.
   .env에 저장될 환경 변수는 개인적으로 물어봅니다.

2. 명령어를 실행합니다.
   node ./src/app.js

## 기여 방법 (Contribution)

1. Fork합니다.
2. 새로운 브랜치를 생성합니다. (`git checkout -b feature/fooBar`)
3. 변경 사항을 커밋합니다. (`git commit -am 'Add some fooBar'`)
4. 브랜치에 푸시합니다. (`git push origin feature/fooBar`)
5. Pull Request를 생성합니다.

## 라이센스 (License)

이 프로젝트는 [MIT](LICENSE) 라이센스를 따릅니다.

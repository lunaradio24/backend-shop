import Response from '../schemas/response.schema.js';

export default (err, req, res, next) => {
  // ValidationError (400)
  if (err.name === 'ValidationError') {
    err.status = 400;
    // blank
    if (err.reason === 'Blank') {
      switch (err.detail) {
        case 'name':
          err.message = '상품 이름을 입력해 주세요.';
          break;

        case 'description':
          err.message = '상품 이름을 입력해 주세요.';
          break;

        case 'manager':
          err.message = '담당자를 입력해 주세요.';
          break;

        case 'password':
          err.message = '비밀번호를 입력해 주세요.';
          break;

        default:
          break;
      }
    }
    // already registered product
    if (err.reason === 'Already Registered') {
      err.message = '이미 등록 된 상품입니다.';
    }
    // invalid product status
    if (err.reason === 'Invalid Product Status') {
      err.message = '상품 상태는 [FOR_SALE, SOLD_OUT] 중 하나여야 합니다.';
    }
  }

  // UnauthorizedError (401)
  else if (
    err.name === 'UnauthorizedError' &&
    err.reason === 'Password Mismatch'
  ) {
    err.status = 401;
    err.message = '비밀번호가 일치하지 않습니다.';
  }

  // NotFound (404)
  else if (err.name === 'NotFound') {
    err.status = 404;
    err.message = '상품이 존재하지 않습니다.';
  }

  // Errors for other reasons
  else {
    err.status = 500;
    err.message = '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.';
  }

  // Console.error and Return
  console.error(err);
  const errResponse = new Response({
    status: err.status,
    message: err.message,
  });
  return res.status(err.status).json(errResponse);
};

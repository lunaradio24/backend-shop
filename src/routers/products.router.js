import express from 'express';
import Product from '../schemas/product.schema.js';
import Response from '../schemas/response.schema.js';
import joi from 'joi';

const router = express.Router();

// joi validation check
const pwPattern = joi
  .string()
  .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$'));

// customizedError
class CustomError extends Error {
  constructor(name, reason, detail) {
    // 부모 클래스(Error)의 생성자 호출
    super();
    // 에러 객체의 속성 설정
    this.name = name;
    this.reason = reason;
    this.detail = detail;
    this.date = new Date();
  }
}

/*****     Create (상품 생성 API)     *****/
router.post('/products', async (req, res, next) => {
  try {
    // 1. 클라이언트로부터 받아온 상품 데이터를 가져온다.
    const { name, description, manager, password } = req.body;

    // 2. 등록할 상품 데이터 중에 전달하지 않은 정보가 있는지 확인한다.
    if (!name) {
      throw new CustomError('ValidationError', 'Blank', 'name');
    }
    if (!description) {
      throw new CustomError('ValidationError', 'Blank', 'description');
    }
    if (!manager) {
      throw new CustomError('ValidationError', 'Blank', 'manager');
    }
    if (!password) {
      throw new CustomError('ValidationError', 'Blank', 'password');
    }

    // 3. 이미 존재하는 상품인지 체크한다.
    const sameProduct = await Product.find({ name: name }).exec();
    if (sameProduct.length > 0) {
      throw new CustomError('ValidationError', 'Already Registered');
    }

    // 4. mongoose Schema로 상품 데이터를 생성한다.
    const createdTime = new Date();
    const product = new Product({
      name: name,
      description: description,
      manager: manager,
      password: password,
      status: 'FOR_SALE',
      createdAt: createdTime,
      updatedAt: createdTime,
    });
    // 5. 생성한 상품 데이터를 DB에 저장한다.
    await product.save();

    // 6. 반환할 상품 정보에서 비밀번호를 제외한다.
    const { pw, ...productWithoutPw } = product._doc;

    // 7. mongoose Schema로 성공 Response를 만든다.
    const successResponse = new Response({
      status: 201,
      message: '상품 생성에 성공했습니다.',
      data: productWithoutPw,
    });

    // 8. 클라이언트에게 반환한다.
    return res.status(201).json(successResponse);

    // 9. 발생한 에러는 catch로 받아서 미들웨어에서 처리한다.
  } catch (error) {
    next(error);
  }
});

/*****     Read (상품 목록 조회 API)    *****/
router.get('/products', async (req, res, next) => {
  try {
    // 1. 상품 목록 조회를 진행한다.
    const products = await Product.find().sort('-createdAt').exec();

    // 2. 반환할 상품 목록 정보에서 비밀번호를 제외한다.
    const responseData = products.map((product) => {
      const { pw, ...productWithoutPw } = product._doc;
      return productWithoutPw;
    });

    // 3. mongoose Schema로 성공 Response를 만든다.
    const successResponse = new Response({
      status: 200,
      message: '상품 목록 조회에 성공했습니다.',
      data: responseData.length > 0 ? responseData : [],
    });

    // 4. 클라이언트에게 반환한다.
    return res.status(200).json(successResponse);

    // 5. 발생한 에러는 catch로 받아서 미들웨어에서 처리한다.
  } catch (error) {
    next(error);
  }
});

/*****     Read (상품 상세 조회 API)     *****/
router.get('/products/:id', async (req, res, next) => {
  try {
    // 1. url에서 받아온 id로 상품 상세 조회를 진행한다.
    const { id } = req.params;
    const product = await Product.findById(id).exec();

    // 2. 해당 상품이 없는 경우 에러가 발생한다.
    if (!product) throw new CustomError('NotFound');

    // 3. 반환할 상품 상세 정보에서 비밀번호를 제외한다.
    const { pw, ...productWithoutPw } = product._doc;

    // 3. mongoose Schema로 성공 Response를 만든다.
    const successResponse = new Response({
      status: 200,
      message: '상품 상세 조회에 성공했습니다.',
      data: productWithoutPw,
    });

    // 4. 클라이언트에게 반환한다.
    return res.status(200).json(successResponse);

    // 5. 발생한 에러는 catch로 받아서 미들웨어에서 처리한다.
  } catch (error) {
    next(error);
  }
});

/*****     Update (상품 수정 API)     *****/
router.put('/products/:id', async (req, res, next) => {
  try {
    // 1. url에서 받아온 id로 상품 상세 조회를 진행한다.
    const { id } = req.params;
    const product = await Product.findById(id).exec();

    // 2. 클라이언트로부터 받아온 상품 데이터를 가져온다.
    const { name, description, manager, password, status } = req.body;

    // 3. 조회된 상품이 없는지 체크한다.
    if (!product) throw new CustomError('NotFound');

    // 4. 입력 받은 비밀번호가 있는지 체크한다.
    if (!password)
      throw new CustomError('ValidationError', 'Blank', 'password');

    // 5. 입력 받은 비밀번호가 일치하는지 체크한다.
    if (password && password !== product.password)
      throw new CustomError('UnauthorizedError', 'Password Mismatch');

    // 6. 입력 받은 상품 상태가 유효한 형태인지 체크한다.
    if (status !== 'FOR_SALE' && status !== 'SOLD_OUT')
      throw new CustomError('ValidationError', 'Invalid Product Status');

    // 7. 입력 받은 수정할 상품 정보가 있다면 수정한다.
    if (name) {
      product.name = name;
    }
    if (description) {
      product.description = description;
    }
    if (manager) {
      product.manager = manager;
    }
    if (status) {
      product.status = status;
    }
    product.updatedAt = new Date();

    // 8. 수정한 정보를 DB에 저장한다.
    await product.save();

    // 9. 반환할 상품 상세 정보에서 비밀번호를 제외한다.
    const { pw, ...productWithoutPw } = product._doc;

    // 10. mongoose Schema로 성공 Response를 만든다.
    const successResponse = new Response({
      status: 200,
      message: '상품 수정에 성공했습니다.',
      data: productWithoutPw,
    });

    // 11. 클라이언트에게 반환한다.
    return res.status(200).json(successResponse);

    // 12. 발생한 에러는 catch로 받아서 미들웨어에서 처리한다.
  } catch (error) {
    next(error);
  }
});

/*****     Delete (상품 삭제 API)     *****/
router.delete('/products/:id', async (req, res, next) => {
  try {
    // 1. url에서 받아온 id로 상품 상세 조회를 진행한다.
    const { id } = req.params;
    const product = await Product.findById(id).exec();

    // 2. 클라이언트로부터 받아온 비밀번호를 가져온다.
    const { password } = req.body;

    // 3. 조회된 상품이 없는지 체크한다.
    if (!product) throw new CustomError('NotFound');

    // 4. 입력 받은 비밀번호가 있는지 체크한다.
    if (!password)
      throw new CustomError('ValidationError', 'Blank', 'password');

    // 5. 입력 받은 비밀번호가 일치하는지 체크한다.
    if (password && password !== product.password)
      throw new CustomError('UnauthorizedError', 'Password Mismatch');

    // 6. 위의 에러들에 걸러지지 않은 경우 DB에서 해당 상품 정보를 삭제한다.
    await Product.deleteOne({ _id: id });

    // 7. mongoose Schema로 성공 Response를 만든다.
    const successResponse = new Response({
      status: 200,
      message: '상품 삭제에 성공했습니다.',
      data: {
        id: id,
      },
    });

    // 8. 클라이언트에게 반환한다.
    return res.status(200).json(successResponse);

    // 9. 발생한 에러는 catch로 받아서 미들웨어에서 처리한다.
  } catch (error) {
    next(error);
  }
});

export default router;

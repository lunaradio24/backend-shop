import express from 'express';
import Product from '../schemas/product.schema.js';
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
    // 1. 클라이언트로부터 받아온 상품 데이터를 가져와서 유효성 검사를 한다.
    const { name, description, manager, password } = req.body;

    // 2. 만약 클라이언트가 등록할 상품 데이터를 전달하지 않았을 때, 클라이언트에게 에러 메시지를 전달한다.
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

    // 4. 상품 등록
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
    await product.save();

    // 5. 상품을 클라이언트에게 반환한다.
    return res.status(201).json({
      status: 201,
      message: '상품 생성에 성공했습니다.',
      data: {
        name: name,
        description: description,
        manager: manager,
        status: 'FOR_SALE',
        createdAt: createdTime,
        updatedAt: createdTime,
      },
    });
  } catch (error) {
    // 라우터 다음에 있는 에러 처리 미들웨어를 실행한다.
    next(error);
  }
});

/*****     Read (상품 목록 조회 API)    *****/
router.get('/products', async (req, res, next) => {
  try {
    // 1. 상품 목록 조회를 진행한다.
    const products = await Product.find().sort('-createdAt').exec();
    const responseData = products.map((product) => {
      const { password, ...productWithoutPw } = product._doc;
      return productWithoutPw;
    });

    // 2. 상품 목록 조회 결과를 클라이언트에게 반환한다.
    return res.status(200).json({
      status: 200,
      message: '상품 목록 조회에 성공했습니다.',
      data: responseData.length > 0 ? responseData : [],
    });
  } catch (error) {
    next(error);
  }
});

/*****     Read (상품 상세 조회 API)     *****/
router.get('/products/:id', async (req, res, next) => {
  try {
    // 1. 상품 상세 조회를 진행한다.
    const { id } = req.params;
    const product = await Product.findById(id).exec();

    // 2. 해당 상품이 없는 경우 에러
    if (!product) throw new CustomError('NotFound');

    // 3. 상품 상세 조회 결과를 클라이언트에게 반환한다.
    const { password, ...productWithoutPw } = product._doc;
    return res.status(200).json({
      status: 200,
      message: '상품 상세 조회에 성공했습니다.',
      data: productWithoutPw,
    });
  } catch (error) {
    next(error);
  }
});

/*****     Update (상품 수정 API)     *****/
router.patch('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, manager, password, status } = req.body;
    const product = await Product.findById(id).exec();

    if (!product) throw new CustomError('NotFound');
    if (!password)
      throw new CustomError('ValidationError', 'Blank', 'password');
    if (password && password !== product.password)
      throw new CustomError('UnauthorizedError', 'Password Mismatch');
    if (status !== 'FOR_SALE' && status !== 'SOLD_OUT')
      throw new CustomError('ValidationError', 'Invalid Product Status');

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

    await product.save();
    const { pw, ...productWithoutPw } = product._doc;
    return res.status(200).json({
      status: 200,
      message: '상품 수정에 성공했습니다.',
      data: productWithoutPw,
    });
  } catch (error) {
    next(error);
  }
});

/*****     Delete (상품 삭제 API)     *****/
router.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const product = await Product.findById(id).exec();
    if (!product) throw new CustomError('NotFound');
    if (!password)
      throw new CustomError('ValidationError', 'Blank', 'password');
    if (password && password !== product.password)
      throw new CustomError('UnauthorizedError', 'Password Mismatch');

    await Product.deleteOne({ _id: id });
    return res.status(200).json({
      status: 200,
      message: '상품 삭제에 성공했습니다.',
      data: {
        id: id,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

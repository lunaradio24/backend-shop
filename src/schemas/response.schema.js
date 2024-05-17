import mongoose from 'mongoose';

const ResponseSchema = new mongoose.Schema({
  status: {
    type: Number, // HTTP Status Code
    required: true,
  },
  message: {
    type: String, // API 호출 성공 또는 실패 메시지
    required: true,
  },
  data: {
    type: Object, // API 호출 결과 데이터
    required: false,
  },
});

// ProductSchema를 바탕으로 Product 모델을 생성하여, 외부로 내보냅니다.
export default mongoose.model('Response', ResponseSchema);

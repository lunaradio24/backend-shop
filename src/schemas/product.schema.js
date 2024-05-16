import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  manager: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    required: false,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
});

// 프론트엔드 서빙을 위한 코드입니다.
ProductSchema.virtual('productId').get(function () {
  return this._id.toHexString();
});
ProductSchema.set('toJSON', {
  virtuals: true,
});

// ProductSchema를 바탕으로 Product 모델을 생성하여, 외부로 내보냅니다.
export default mongoose.model('Product', ProductSchema);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
// dotenv 설정 로드
dotenv.config();

// 환경 변수 가져오기
const dbUrl = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_NAME;

const connect = () => {
  // mongoose.connect는 MongoDB 서버에 연결하는 메서드입니다.
  mongoose
    .connect(dbUrl, { dbName: dbName })
    .then(() => console.log('MongoDB 연결에 성공하였습니다.'))
    .catch((err) => console.log(`MongoDB 연결에 실패하였습니다. ${err}`));
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB 연결 에러', err);
});

export default connect;

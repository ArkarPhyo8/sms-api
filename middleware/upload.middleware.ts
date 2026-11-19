import { AppError } from '@/errors/app.error';
import multer from 'multer';

// 1. ဖိုင်ကို Hard Disk ထဲမှာ အရင်မသိမ်းဘဲ Server ရဲ့ RAM (Memory) ထဲမှာ Buffer အနေနဲ့ ခဏသိမ်းသည်
const storage = multer.memoryStorage();

// 2. ပို့လာတဲ့ဖိုင်ဟာ Image ဟုတ်မဟုတ် စစ်ဆေးတဲ့ Filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: Function) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);  // ပုံမှန်ဆိုရင် လက်ခံသည် (accept)
  } else {
    cb(new AppError('Not an image! Please upload only image files.', 400), false); // ပုံမဟုတ်ရင် Error ပစ်မည်
  }
};

// 3. သတ်မှတ်ချက်များနှင့်အတူ Multer ကို Export လုပ်သည်
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // ဖိုင်ဆိုဒ် အများဆုံး 5MB ထက် မကျော်ရ
  },
});
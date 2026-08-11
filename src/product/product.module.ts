import { BadRequestException, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    UserModule,
    JwtModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './images/products',

        filename(req, file, cb) {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;

          const filename = `${uniqueName}-${file.originalname}`;

          cb(null, filename);
        },
      }),

      fileFilter(req, file, cb) {
        if (file.mimetype.startsWith('image')) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('Bu tür dosyaları yükleyemezsiniz'),
            false,
          );
        }
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}

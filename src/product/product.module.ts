import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[UserModule,JwtModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}

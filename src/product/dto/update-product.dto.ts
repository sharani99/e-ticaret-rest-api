import {
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
  Min,
  Length,
  MinLength,
  IsInt,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Fiyat 0 veya daha büyük olmalıdır' })
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Stok 0 veya daha büyük olmalıdır' })
  stock?: number;
}
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MinLength,
  IsInt,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  stock!: number;

  @IsInt()
  @Min(1)
  categoryId!: number;
}

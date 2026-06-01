import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class HeadersDto {
  @Expose({ name: 'x-device-id' })
  @IsOptional()
  'authorization'?: string;
}

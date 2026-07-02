import { plainToInstance, Transform, Type } from 'class-transformer';
import { name } from '@package.json';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

const toBoolean = ({ obj, key }: { obj: Record<string, unknown>; key: string }) =>
  obj[key] === true || obj[key] === 'true';

enum Environment {
  Development = 'development',
  Homologation = 'homologation',
  Production = 'production',
  Test = 'test',
  Local = 'local',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  STAGE: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsNotEmpty()
  @IsString()
  SERVICE_NAME: string;

  @IsNotEmpty()
  @IsString()
  DB_HOST: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(65535)
  DB_PORT: number;

  @IsNotEmpty()
  @IsString()
  DB_USER: string;

  @IsNotEmpty()
  @IsString()
  DB_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  DB_NAME: string;

  @IsNotEmpty()
  @IsString()
  DB_TYPE: string;

  @Transform(toBoolean)
  @IsBoolean()
  DB_SYNCHRONIZE: boolean;

  @Transform(toBoolean)
  @IsBoolean()
  DB_AUTO_LOAD_ENTITIES: boolean;

  @Type(() => Number)
  @IsNumber()
  @Min(4)
  @Max(20)
  BCRYPT_SALT_ROUNDS: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  process.env.SERVICE_NAME = name;
  validatedConfig.SERVICE_NAME = name;

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}

import { Module } from '@nestjs/common';
import { TypeormModule } from './typeorm/typeorm.module';

@Module({
  imports: [TypeormModule],
  providers: [],
  exports: [TypeormModule],
})
export class InfrastructureModule {
  onModuleInit() {
    console.log(`The InfrastructureModule has been initialized.`);
  }
}

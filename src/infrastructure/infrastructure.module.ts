import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class InfrastructureModule {
  onModuleInit() {
    console.log(`The InfrastructureModule has been initialized.`);
  }
}

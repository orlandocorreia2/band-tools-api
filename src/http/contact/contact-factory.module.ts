import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateContactUseCase } from '@usecase/contact/create-contact.usecase';
import { ListContactsByUserUseCase } from '@usecase/contact/list-contacts-by-user.usecase';
import { ContactRepository } from '@infrastructure/repository/contact/contact.repository';
import { ContactTypeormEntity } from '@infrastructure/entities/contact/contact-typeorm.entity';

@Module({})
export class ContactFactoryModule {
  static readonly CREATE_CONTACT_USE_CASE = 'CreateContactUseCase';
  static readonly LIST_CONTACTS_BY_USER_USE_CASE = 'ListContactsByUserUseCase';

  static forRoot(): DynamicModule {
    return {
      module: ContactFactoryModule,
      imports: [TypeOrmModule.forFeature([ContactTypeormEntity])],
      providers: [
        ContactRepository,
        {
          provide: ContactFactoryModule.CREATE_CONTACT_USE_CASE,
          inject: [ContactRepository],
          useFactory: (contactRepository: ContactRepository) =>
            new CreateContactUseCase(contactRepository),
        },
        {
          provide: ContactFactoryModule.LIST_CONTACTS_BY_USER_USE_CASE,
          inject: [ContactRepository],
          useFactory: (contactRepository: ContactRepository) =>
            new ListContactsByUserUseCase(contactRepository),
        },
      ],
      exports: [
        ContactFactoryModule.CREATE_CONTACT_USE_CASE,
        ContactFactoryModule.LIST_CONTACTS_BY_USER_USE_CASE,
      ],
    };
  }
}

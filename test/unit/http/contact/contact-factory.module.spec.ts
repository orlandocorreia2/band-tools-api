jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forFeature: jest
      .fn()
      .mockReturnValue({ module: class TypeOrmFeatureModule {} }),
  },
  InjectRepository: () => () => {},
}));

jest.mock('@usecase/contact/create-contact.usecase', () => ({
  CreateContactUseCase: jest
    .fn()
    .mockImplementation(() => ({ execute: jest.fn() })),
}));

jest.mock('@infrastructure/entities/contact/contact-typeorm.entity', () => ({
  ContactTypeormEntity: class ContactTypeormEntity {},
}));

jest.mock('@infrastructure/repository/contact/contact.repository', () => ({
  ContactRepository: class ContactRepository {},
}));

import { ContactFactoryModule } from '@http/contact/contact-factory.module';
import { CreateContactUseCase } from '@usecase/contact/create-contact.usecase';
import type { ContactRepository } from '@infrastructure/repository/contact/contact.repository';

describe('ContactFactoryModule', () => {
  it('should be defined', () => {
    expect(ContactFactoryModule).toBeDefined();
  });

  it('should expose CREATE_CONTACT_USE_CASE token', () => {
    expect(ContactFactoryModule.CREATE_CONTACT_USE_CASE).toBe(
      'CreateContactUseCase',
    );
  });

  it('should return a DynamicModule from forRoot()', () => {
    const module = ContactFactoryModule.forRoot();

    expect(module).toBeDefined();
    expect(module.module).toBe(ContactFactoryModule);
    expect(module.providers).toBeDefined();
    expect(module.exports).toContain(
      ContactFactoryModule.CREATE_CONTACT_USE_CASE,
    );
  });

  it('should wire CreateContactUseCase with ContactRepository via useFactory', () => {
    const module = ContactFactoryModule.forRoot();
    const factoryProvider = (module.providers as any[]).find(
      (p) => p.provide === ContactFactoryModule.CREATE_CONTACT_USE_CASE,
    );
    const mockRepo: jest.Mocked<InstanceType<typeof ContactRepository>> = {
      save: jest.fn(),
    } as any;

    factoryProvider.useFactory(mockRepo);

    expect(CreateContactUseCase).toHaveBeenCalledWith(mockRepo);
  });
});

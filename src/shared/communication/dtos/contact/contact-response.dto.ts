import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactEntity } from '@domain/entities/contact/contact.entity';

export class ContactResponseDto {
  @ApiProperty({ example: '0192b1e0-6c3f-7c3a-9b1a-2f6d8e6d1a2b' })
  readonly id: string;

  @ApiProperty({ example: 'Maria Souza' })
  readonly name: string;

  @ApiProperty({ example: '11987654321' })
  readonly phone: string;

  @ApiPropertyOptional({ example: '1133654321' })
  readonly alternate_phone?: string;

  @ApiProperty({ example: 'Bar do Zé' })
  readonly venue_name: string;

  @ApiProperty({ example: 'Rua das Flores, 123 - São Paulo/SP' })
  readonly address: string;

  @ApiProperty({ example: 'contato@bardoze.com' })
  readonly email: string;

  @ApiProperty({ example: 'Produtor' })
  readonly role: string;

  @ApiPropertyOptional({ example: 'Prefere contato via WhatsApp' })
  readonly notes?: string;

  @ApiProperty()
  readonly created_at: Date;

  @ApiProperty()
  readonly updated_at: Date;

  private constructor(contact: ContactEntity) {
    this.id = contact.id;
    this.name = contact.name;
    this.phone = contact.phone;
    this.alternate_phone = contact.alternate_phone;
    this.venue_name = contact.venue_name;
    this.address = contact.address;
    this.email = contact.email;
    this.role = contact.role;
    this.notes = contact.notes;
    this.created_at = contact.created_at;
    this.updated_at = contact.updated_at;
  }

  static fromEntity(contact: ContactEntity): ContactResponseDto {
    return new ContactResponseDto(contact);
  }

  static fromEntities(contacts: ContactEntity[]): ContactResponseDto[] {
    return contacts.map((contact) => ContactResponseDto.fromEntity(contact));
  }
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactEntity } from '@domain/entities/contact/contact.entity';

export class BandBookingContactResponseDto {
  @ApiProperty({ example: '0192b1e0-6c3f-7c3a-9b1a-2f6d8e6d1a2b' })
  readonly id: string;

  @ApiProperty({ example: 'Maria Souza' })
  readonly name: string;

  @ApiProperty({ example: '11987654321' })
  readonly phone: string;

  @ApiPropertyOptional({ example: '1133654321', nullable: true })
  readonly alternate_phone: string | null;

  @ApiProperty({ example: 'Bar do Zé' })
  readonly venue_name: string;

  @ApiProperty({ example: 'Rua das Flores, 123 - São Paulo/SP' })
  readonly address: string;

  @ApiProperty({ example: 'contato@bardoze.com' })
  readonly email: string;

  @ApiProperty({ example: 'Produtor' })
  readonly role: string;

  @ApiPropertyOptional({
    example: 'Prefere contato via WhatsApp',
    nullable: true,
  })
  readonly notes: string | null;

  private constructor(contact: ContactEntity) {
    this.id = contact.id;
    this.name = contact.name;
    this.phone = contact.phone;
    this.alternate_phone = contact.alternate_phone ?? null;
    this.venue_name = contact.venue_name;
    this.address = contact.address;
    this.email = contact.email;
    this.role = contact.role;
    this.notes = contact.notes ?? null;
  }

  static fromEntity(contact: ContactEntity): BandBookingContactResponseDto {
    return new BandBookingContactResponseDto(contact);
  }
}

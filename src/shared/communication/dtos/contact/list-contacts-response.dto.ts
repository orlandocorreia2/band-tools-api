import { ApiProperty } from '@nestjs/swagger';
import { ContactEntity } from '@domain/entities/contact/contact.entity';
import { ContactResponseDto } from './contact-response.dto';

export class ListContactsResponseDto {
  @ApiProperty({ type: [ContactResponseDto] })
  readonly data: ContactResponseDto[];

  private constructor(data: ContactResponseDto[]) {
    this.data = data;
  }

  static fromEntities(contacts: ContactEntity[]): ListContactsResponseDto {
    return new ListContactsResponseDto(
      ContactResponseDto.fromEntities(contacts),
    );
  }
}

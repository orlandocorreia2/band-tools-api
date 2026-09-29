import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BandTypeormEntity } from '@infrastructure/entities/band/band-typeorm.entity';
import { BandMemberTypeormEntity } from '@infrastructure/entities/band/band-member-typeorm.entity';
import { BandSetlistTypeormEntity } from '@infrastructure/entities/band/band-setlist-typeorm.entity';
import { BandSetlistSongTypeormEntity } from '@infrastructure/entities/band/band-setlist-song-typeorm.entity';
import { BandSongTypeormEntity } from '@infrastructure/entities/band/band-song-typeorm.entity';
import { BandBookingTypeormEntity } from '@infrastructure/entities/band/band-booking-typeorm.entity';
import { UserTypeormEntity } from '@infrastructure/entities/user/user-typeorm.entity';
import { ContactTypeormEntity } from '@infrastructure/entities/contact/contact-typeorm.entity';
import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { BandMemberRepository } from '@infrastructure/repository/band/band-member.repository';
import { BandSetlistRepository } from '@infrastructure/repository/band/band-setlist.repository';
import { BandSetlistSongRepository } from '@infrastructure/repository/band/band-setlist-song.repository';
import { BandSongRepository } from '@infrastructure/repository/band/band-song.repository';
import { BandBookingRepository } from '@infrastructure/repository/band/band-booking.repository';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { ContactRepository } from '@infrastructure/repository/contact/contact.repository';

const REPOSITORIES = [
  BandRepository,
  BandMemberRepository,
  BandSetlistRepository,
  BandSetlistSongRepository,
  BandSongRepository,
  BandBookingRepository,
  UserRepository,
  ContactRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BandTypeormEntity,
      BandMemberTypeormEntity,
      BandSetlistTypeormEntity,
      BandSetlistSongTypeormEntity,
      BandSongTypeormEntity,
      BandBookingTypeormEntity,
      UserTypeormEntity,
      ContactTypeormEntity,
    ]),
  ],
  providers: REPOSITORIES,
  exports: REPOSITORIES,
})
export class PersistenceModule {}

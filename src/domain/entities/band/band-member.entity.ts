type BandMemberProps = {
  band_id: string;
  user_id: string;
  is_owner?: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export class BandMemberEntity {
  readonly band_id: string;
  readonly user_id: string;
  readonly is_owner: boolean;
  readonly created_at: Date;
  readonly updated_at: Date;

  constructor(props: BandMemberProps) {
    this.band_id = props.band_id;
    this.user_id = props.user_id;
    this.is_owner = props.is_owner ?? false;
    this.created_at = props.created_at ?? new Date();
    this.updated_at = props.updated_at ?? new Date();
  }
}

import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class HealthResponse {
  @Expose()
  status: string;

  @Expose()
  timestamp: string;

  @Expose()
  environment: string;

  @Expose()
  database: string;

  @Expose()
  uptime?: number;
}

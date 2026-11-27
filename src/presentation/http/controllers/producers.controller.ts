import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProducerIntervalsService } from '../../../domain/services/producer-intervals.service';
import { AwardIntervalsResponseDto } from '../dto/award-intervals-response.dto';

@ApiTags('producers')
@Controller('producers')
export class ProducersController {
  constructor(
    private readonly producerIntervalsService: ProducerIntervalsService,
  ) {}

  @Get('awards-top-intervals')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Retrieve the top 2 producers with the smallest and largest consecutive award intervals',
  })
  @ApiOkResponse({ type: AwardIntervalsResponseDto })
  async getDefaultTopAwardIntervals(): Promise<AwardIntervalsResponseDto> {
    return this.producerIntervalsService.getTopAwardIntervals();
  }

  @Get('awards-top-intervals/:limit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Retrieve the top N producers with the smallest and largest consecutive award intervals',
  })
  @ApiParam({
    name: 'limit',
    type: Number,
    description: 'Number of top producers to return for both min and max lists (>= 1)',
    example: 3,
  })
  @ApiOkResponse({ type: AwardIntervalsResponseDto })
  @ApiBadRequestResponse({
    description: 'Limit parameter must be a positive integer >= 1',
  })
  async getCustomTopAwardIntervals(
    @Param('limit', ParseIntPipe) limit: number,
  ): Promise<AwardIntervalsResponseDto> {
    return this.producerIntervalsService.getTopAwardIntervals(limit);
  }
}

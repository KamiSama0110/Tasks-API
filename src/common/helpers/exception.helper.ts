import { BadRequestException, InternalServerErrorException, Logger } from "@nestjs/common";

const logger = new Logger('DBExceptionHandler');

export const handleDBExceptions = (error: any): never => {

    const code = error?.code ?? error?.driverError?.code;
    const detail = error?.detail ?? error?.driverError?.detail;

    if (code === '23505') throw new BadRequestException(detail || 'Duplicate record');

    logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
import { Controller, Get, Route, SuccessResponse, Tags } from 'tsoa';

@Tags('Health')
@Route('health')
export class HealthController extends Controller {
  @Get()
  @SuccessResponse('200', "Service's Status")
  public get() {
    return { status: 'healthy' };
  }
}

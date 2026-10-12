import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions/permissions.guard';
import { PositiveIntPipe } from '../common/pipes/positive-int-pipe';

import { ActivityLogsService } from './activity-logs.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';

@Controller('activity-logs')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ActivityLogsController {
    constructor(private readonly activityLogsService: ActivityLogsService) {}

    @Post()
    @Permissions('create_activity')
    create(@Body() createActivityLogDto: CreateActivityLogDto) {
        return this.activityLogsService.create(createActivityLogDto);
    }

    @Get()
    @Permissions('read_activity')
    findAll() {
        return this.activityLogsService.findAll();
    }

    @Get(':id')
    @Permissions('read_activity')
    findOne(@Param('id', PositiveIntPipe) id: number) {
        return this.activityLogsService.findOne(id);
    }

    @Patch(':id')
    @Permissions('update_activity')
    update(@Param('id', PositiveIntPipe) id: number, @Body() updateActivityLogDto: UpdateActivityLogDto) {
        return this.activityLogsService.update(id, updateActivityLogDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permissions('delete_activity')
    remove(@Param('id', PositiveIntPipe) id: number) {
        return this.activityLogsService.remove(id);
    }
}

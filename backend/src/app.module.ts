import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { DepartmentsModule } from './departments/departments.module';
import { GradesModule } from './grades/grades.module';
import { SubjectsModule } from './subjects/subjects.module';
import { AchievementsModule } from './achievements/achievements.module';
import { UploadsModule } from './uploads/uploads.module';
import { LogsModule } from './logs/logs.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    DepartmentsModule,
    GradesModule,
    SubjectsModule,
    AchievementsModule,
    UploadsModule,
    LogsModule,
    AdminModule,
  ],
  controllers: [AppController, NotificationsController],
  providers: [AppService, NotificationsService],
})
export class AppModule {}

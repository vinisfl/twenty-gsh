import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test, type TestingModule } from '@nestjs/testing';

import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

describe('SignInUpService', () => {
  let signInUpService: SignInUpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUpService,
        { provide: getRepositoryToken(UserEntity), useValue: {} },
        { provide: getRepositoryToken(WorkspaceEntity), useValue: {} },
        { provide: getDataSourceToken(), useValue: {} },
        { provide: WorkspaceInvitationService, useValue: {} },
        { provide: UserWorkspaceService, useValue: {} },
        { provide: OnboardingService, useValue: {} },
        { provide: WorkspaceEventEmitter, useValue: {} },
        { provide: TwentyConfigService, useValue: {} },
        { provide: SubdomainManagerService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: MetricsService, useValue: {} },
        { provide: WorkspaceCacheService, useValue: {} },
        { provide: ApplicationService, useValue: {} },
        { provide: FileCorePictureService, useValue: {} },
        { provide: EnterprisePlanService, useValue: {} },
        { provide: EventLogEmitterService, useValue: {} },
        { provide: BillingCreditService, useValue: {} },
        { provide: BillingService, useValue: {} },
      ],
    }).compile();

    signInUpService = module.get<SignInUpService>(SignInUpService);
  });

  describe('computePartialUserFromUserPayload', () => {
    it('defaults locale to pt-BR when the payload does not specify one', async () => {
      const partialUser =
        await signInUpService.computePartialUserFromUserPayload(
          { email: 'test@example.com' },
          { provider: AuthProviderEnum.Google },
        );

      expect(partialUser.locale).toBe('pt-BR');
    });

    it('keeps the payload locale when one is provided', async () => {
      const partialUser =
        await signInUpService.computePartialUserFromUserPayload(
          { email: 'test@example.com', locale: 'fr-FR' },
          { provider: AuthProviderEnum.Google },
        );

      expect(partialUser.locale).toBe('fr-FR');
    });
  });
});

import { PrismaClient, RoleType, TrialStatus, SubjectStatus, VisitStatus, VisitType, AESeverity, AERelationship, AEOutcome, AEAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  const hashedPassword = await bcrypt.hash('password', 10);

  console.log('创建用户账号...');
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@clinical.com' },
    update: {},
    create: {
      email: 'admin@clinical.com',
      password: hashedPassword,
      name: '系统管理员',
      role: RoleType.ADMIN,
      phone: '13800000001',
      department: '信息科',
      title: '高级工程师',
      isActive: true,
    },
  });

  const investigator = await prisma.user.upsert({
    where: { email: 'investigator@clinical.com' },
    update: {},
    create: {
      email: 'investigator@clinical.com',
      password: hashedPassword,
      name: '张研究员',
      role: RoleType.INVESTIGATOR,
      phone: '13800000002',
      department: '临床研究中心',
      title: '主要研究者',
      isActive: true,
    },
  });

  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@clinical.com' },
    update: {},
    create: {
      email: 'doctor@clinical.com',
      password: hashedPassword,
      name: '李医生',
      role: RoleType.DOCTOR,
      phone: '13800000003',
      department: '内科',
      title: '主治医师',
      isActive: true,
    },
  });

  const coordinator = await prisma.user.upsert({
    where: { email: 'coordinator@clinical.com' },
    update: {},
    create: {
      email: 'coordinator@clinical.com',
      password: hashedPassword,
      name: '王协调员',
      role: RoleType.COORDINATOR,
      phone: '13800000004',
      department: '临床研究中心',
      title: '临床协调员',
      isActive: true,
    },
  });

  const monitor = await prisma.user.upsert({
    where: { email: 'monitor@clinical.com' },
    update: {},
    create: {
      email: 'monitor@clinical.com',
      password: hashedPassword,
      name: '陈监查员',
      role: RoleType.MONITOR,
      phone: '13800000005',
      department: '药物警戒部',
      title: '临床监查员',
      isActive: true,
    },
  });

  console.log('用户账号创建完成！');

  console.log('创建试验项目...');

  const trial1 = await prisma.trial.upsert({
    where: { trialNumber: 'TRIAL-2024-001' },
    update: {},
    create: {
      trialNumber: 'TRIAL-2024-001',
      title: '新型抗高血压药物X临床III期研究',
      shortName: 'ANTI-HTN-X-III',
      description: '本研究旨在评估新型抗高血压药物X在原发性高血压患者中的安全性和有效性。采用随机、双盲、安慰剂对照的多中心研究设计。',
      protocolNumber: 'PROTO-2024-001',
      indication: '原发性高血压',
      drugName: '药物X',
      phase: 'III期',
      status: TrialStatus.ACTIVE,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-12-31'),
      plannedSubjects: 200,
      actualSubjects: 45,
      sponsor: '华药制药股份有限公司',
      cro: '康龙临床CRO',
      siteName: '北京协和医院临床研究中心',
      piName: '张教授',
      createdById: admin.id,
    },
  });

  const trial2 = await prisma.trial.upsert({
    where: { trialNumber: 'TRIAL-2024-002' },
    update: {},
    create: {
      trialNumber: 'TRIAL-2024-002',
      title: '糖尿病治疗新药Y的II期临床研究',
      shortName: 'DM-Y-II',
      description: '评估新型糖尿病药物Y在2型糖尿病患者中的疗效和安全性，探索最佳剂量范围。',
      protocolNumber: 'PROTO-2024-002',
      indication: '2型糖尿病',
      drugName: '药物Y',
      phase: 'II期',
      status: TrialStatus.RECRUITING,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-06-30'),
      plannedSubjects: 120,
      actualSubjects: 28,
      sponsor: '绿叶制药集团',
      cro: '泰格医药',
      siteName: '上海瑞金医院内分泌科',
      piName: '李教授',
      createdById: investigator.id,
    },
  });

  const trial3 = await prisma.trial.upsert({
    where: { trialNumber: 'TRIAL-2023-005' },
    update: {},
    create: {
      trialNumber: 'TRIAL-2023-005',
      title: '肿瘤免疫治疗药物Z的I期研究',
      shortName: 'ONCO-Z-I',
      description: '晚期实体瘤患者中的I期临床研究，主要目的是评估药物Z的安全性、耐受性和药代动力学特征。',
      protocolNumber: 'PROTO-2023-005',
      indication: '晚期实体瘤',
      drugName: '药物Z',
      phase: 'I期',
      status: TrialStatus.COMPLETED,
      startDate: new Date('2023-01-10'),
      endDate: new Date('2023-12-20'),
      plannedSubjects: 30,
      actualSubjects: 30,
      sponsor: '信达生物',
      cro: '药明康德',
      siteName: '中山大学肿瘤防治中心',
      piName: '王教授',
      createdById: admin.id,
    },
  });

  console.log('试验项目创建完成！');

  console.log('创建受试者数据...');

  const subjectsData = [
    { subjectNumber: 'S001', initials: '张三', gender: '男', birthDate: new Date('1985-03-15'), status: SubjectStatus.ACTIVE, enrollmentDate: new Date('2024-02-01'), trialId: trial1.id, createdById: coordinator.id },
    { subjectNumber: 'S002', initials: '李四', gender: '女', birthDate: new Date('1978-07-22'), status: SubjectStatus.ACTIVE, enrollmentDate: new Date('2024-02-10'), trialId: trial1.id, createdById: coordinator.id },
    { subjectNumber: 'S003', initials: '王五', gender: '男', birthDate: new Date('1990-11-08'), status: SubjectStatus.ACTIVE, enrollmentDate: new Date('2024-02-20'), trialId: trial1.id, createdById: coordinator.id },
    { subjectNumber: 'S004', initials: '赵六', gender: '女', birthDate: new Date('1972-05-30'), status: SubjectStatus.WITHDRAWN, enrollmentDate: new Date('2024-01-25'), trialId: trial1.id, createdById: coordinator.id, withdrawalDate: new Date('2024-03-15'), withdrawalReason: '受试者主动退出' },
    { subjectNumber: 'S005', initials: '孙七', gender: '男', birthDate: new Date('1988-09-12'), status: SubjectStatus.SCREENING, trialId: trial1.id, createdById: coordinator.id },
    { subjectNumber: 'S006', initials: '周八', gender: '女', birthDate: new Date('1995-04-18'), status: SubjectStatus.ENROLLED, enrollmentDate: new Date('2024-04-01'), trialId: trial1.id, createdById: coordinator.id },
    { subjectNumber: 'S007', initials: '吴九', gender: '男', birthDate: new Date('1980-12-25'), status: SubjectStatus.ACTIVE, enrollmentDate: new Date('2024-03-05'), trialId: trial1.id, createdById: coordinator.id },
    { subjectNumber: 'S008', initials: '郑十', gender: '女', birthDate: new Date('1975-08-05'), status: SubjectStatus.COMPLETED, enrollmentDate: new Date('2024-01-20'), trialId: trial1.id, createdById: coordinator.id },
  ];

  const subjects = [];
  for (const s of subjectsData) {
    const subject = await prisma.subject.upsert({
      where: { subjectNumber: s.subjectNumber },
      update: {},
      create: s,
    });
    subjects.push(subject);
  }

  const dmSubjectsData = [
    { subjectNumber: 'DM001', initials: '陈A', gender: '男', birthDate: new Date('1970-06-15'), status: SubjectStatus.ACTIVE, enrollmentDate: new Date('2024-03-10'), trialId: trial2.id, createdById: doctor.id },
    { subjectNumber: 'DM002', initials: '刘B', gender: '女', birthDate: new Date('1965-11-20'), status: SubjectStatus.ACTIVE, enrollmentDate: new Date('2024-03-15'), trialId: trial2.id, createdById: doctor.id },
    { subjectNumber: 'DM003', initials: '杨C', gender: '男', birthDate: new Date('1982-02-28'), status: SubjectStatus.SCREENING, trialId: trial2.id, createdById: doctor.id },
  ];

  for (const s of dmSubjectsData) {
    const subject = await prisma.subject.upsert({
      where: { subjectNumber: s.subjectNumber },
      update: {},
      create: s,
    });
    subjects.push(subject);
  }

  console.log('受试者数据创建完成！');

  console.log('创建随访/访视数据...');

  const visitsData = [
    { visitNumber: 'V1', name: '筛查访视', type: VisitType.SCREENING, status: VisitStatus.COMPLETED, scheduledDate: new Date('2024-01-25'), actualDate: new Date('2024-01-25'), subjectId: subjects[0].id, trialId: trial1.id, createdById: coordinator.id, completedById: doctor.id },
    { visitNumber: 'V2', name: '基线访视', type: VisitType.BASELINE, status: VisitStatus.COMPLETED, scheduledDate: new Date('2024-02-01'), actualDate: new Date('2024-02-01'), subjectId: subjects[0].id, trialId: trial1.id, createdById: coordinator.id, completedById: doctor.id },
    { visitNumber: 'V3', name: '第2周随访', type: VisitType.FOLLOW_UP, status: VisitStatus.COMPLETED, scheduledDate: new Date('2024-02-15'), actualDate: new Date('2024-02-16'), subjectId: subjects[0].id, trialId: trial1.id, createdById: coordinator.id, completedById: doctor.id },
    { visitNumber: 'V4', name: '第4周随访', type: VisitType.FOLLOW_UP, status: VisitStatus.COMPLETED, scheduledDate: new Date('2024-02-29'), actualDate: new Date('2024-02-29'), subjectId: subjects[0].id, trialId: trial1.id, createdById: coordinator.id, completedById: doctor.id },
    { visitNumber: 'V5', name: '第8周随访', type: VisitType.FOLLOW_UP, status: VisitStatus.SCHEDULED, scheduledDate: new Date('2024-04-30'), subjectId: subjects[0].id, trialId: trial1.id, createdById: coordinator.id },
    { visitNumber: 'V6', name: '第12周随访', type: VisitType.FOLLOW_UP, status: VisitStatus.SCHEDULED, scheduledDate: new Date('2024-05-28'), subjectId: subjects[0].id, trialId: trial1.id, createdById: coordinator.id },
  ];

  for (const v of visitsData) {
    await prisma.visit.upsert({
      where: { id: -1 },
      update: {},
      create: v,
    }).catch(async () => {
      await prisma.visit.create({ data: v });
    });
  }

  const subject1Visits = [
    { visitNumber: 'V1', name: '筛查访视', type: VisitType.SCREENING, status: VisitStatus.COMPLETED, scheduledDate: new Date('2024-02-05'), actualDate: new Date('2024-02-05'), subjectId: subjects[1].id, trialId: trial1.id, createdById: coordinator.id, completedById: doctor.id },
    { visitNumber: 'V2', name: '基线访视', type: VisitType.BASELINE, status: VisitStatus.COMPLETED, scheduledDate: new Date('2024-02-10'), actualDate: new Date('2024-02-10'), subjectId: subjects[1].id, trialId: trial1.id, createdById: coordinator.id, completedById: doctor.id },
    { visitNumber: 'V3', name: '第2周随访', type: VisitType.FOLLOW_UP, status: VisitStatus.MISSED, scheduledDate: new Date('2024-02-24'), subjectId: subjects[1].id, trialId: trial1.id, createdById: coordinator.id },
    { visitNumber: 'V4', name: '第4周随访', type: VisitType.FOLLOW_UP, status: VisitStatus.COMPLETED, scheduledDate: new Date('2024-03-09'), actualDate: new Date('2024-03-10'), subjectId: subjects[1].id, trialId: trial1.id, createdById: coordinator.id, completedById: doctor.id },
    { visitNumber: 'V5', name: '第8周随访', type: VisitType.FOLLOW_UP, status: VisitStatus.IN_PROGRESS, scheduledDate: new Date('2024-04-06'), actualDate: new Date('2024-04-06'), subjectId: subjects[1].id, trialId: trial1.id, createdById: coordinator.id },
  ];

  for (const v of subject1Visits) {
    await prisma.visit.create({ data: v });
  }

  console.log('随访数据创建完成！');

  console.log('创建不良事件数据...');

  const aeData = [
    {
      aeNumber: 'AE-2024-001',
      term: '头痛',
      description: '受试者在服药后第3天出现轻度头痛，持续约2小时后自行缓解。',
      startDate: new Date('2024-02-04'),
      endDate: new Date('2024-02-04'),
      severity: AESeverity.MILD,
      seriousness: false,
      relationship: AERelationship.POSSIBLE,
      outcome: AEOutcome.RECOVERED,
      action: AEAction.NONE,
      isSAE: false,
      subjectId: subjects[0].id,
      trialId: trial1.id,
      createdById: doctor.id,
    },
    {
      aeNumber: 'AE-2024-002',
      term: '恶心',
      description: '服药后出现轻度恶心，伴有食欲下降，未作特殊处理。',
      startDate: new Date('2024-02-18'),
      endDate: new Date('2024-02-20'),
      severity: AESeverity.MILD,
      seriousness: false,
      relationship: AERelationship.PROBABLE,
      outcome: AEOutcome.RECOVERED,
      action: AEAction.NONE,
      isSAE: false,
      subjectId: subjects[0].id,
      trialId: trial1.id,
      createdById: doctor.id,
    },
    {
      aeNumber: 'AE-2024-003',
      term: '头晕',
      description: '站立时出现短暂性头晕，平卧后缓解。',
      startDate: new Date('2024-02-12'),
      endDate: new Date('2024-02-15'),
      severity: AESeverity.MODERATE,
      seriousness: false,
      relationship: AERelationship.PROBABLE,
      outcome: AEOutcome.RECOVERED,
      action: AEAction.DOSE_REDUCED,
      isSAE: false,
      subjectId: subjects[1].id,
      trialId: trial1.id,
      createdById: doctor.id,
    },
    {
      aeNumber: 'AE-2024-004',
      term: '过敏性皮疹',
      description: '服药后第5天全身出现散在红色皮疹，伴瘙痒。给予抗组胺药物治疗。',
      startDate: new Date('2024-03-05'),
      endDate: new Date('2024-03-12'),
      severity: AESeverity.MODERATE,
      seriousness: false,
      relationship: AERelationship.DEFINITE,
      outcome: AEOutcome.RECOVERED,
      action: AEAction.TREATMENT_GIVEN,
      isSAE: false,
      subjectId: subjects[2].id,
      trialId: trial1.id,
      createdById: doctor.id,
    },
    {
      aeNumber: 'AE-2024-005',
      term: '严重低血压',
      description: '受试者服药后出现血压明显下降（收缩压降至85mmHg），伴有意识模糊，紧急住院治疗。',
      startDate: new Date('2024-03-10'),
      severity: AESeverity.SEVERE,
      seriousness: true,
      relationship: AERelationship.DEFINITE,
      outcome: AEOutcome.RECOVERING,
      action: AEAction.HOSPITALIZATION,
      isSAE: true,
      saeReportedDate: new Date('2024-03-10'),
      reportedToEthics: new Date('2024-03-11'),
      subjectId: subjects[3].id,
      trialId: trial1.id,
      createdById: investigator.id,
    },
  ];

  for (const ae of aeData) {
    await prisma.adverseEvent.upsert({
      where: { aeNumber: ae.aeNumber },
      update: {},
      create: ae,
    });
  }

  console.log('不良事件数据创建完成！');
  console.log('数据库初始化完成！');
  console.log('');
  console.log('=== 测试账号 ===');
  console.log('管理员: admin@clinical.com / password');
  console.log('研究者: investigator@clinical.com / password');
  console.log('医生: doctor@clinical.com / password');
  console.log('协调员: coordinator@clinical.com / password');
  console.log('监查员: monitor@clinical.com / password');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

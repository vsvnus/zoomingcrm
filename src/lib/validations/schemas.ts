import { z } from 'zod'

// ============================================
// SHARED SCHEMAS
// ============================================
export const cuidSchema = z.string().min(1, 'ID é obrigatório')
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)')
export const optionalDateSchema = dateSchema.optional().nullable()
export const positiveDecimalSchema = z.number().min(0, 'Valor deve ser positivo')

// ============================================
// PROJECTS
// ============================================
export const createProjectSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  client_id: cuidSchema,
  description: z.string().max(2000).optional().nullable(),
})

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['BRIEFING', 'PRE_PROD', 'SHOOTING', 'POST_PROD', 'REVIEW', 'DONE']).optional(),
  budget: positiveDecimalSchema.optional(),
  deadline_date: optionalDateSchema,
  client_id: cuidSchema.optional(),
  assigned_to_id: cuidSchema.optional().nullable(),
}).strict()

export const shootingDateSchema = z.object({
  date: dateSchema,
  time: z.string().max(20).optional(),
  location: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
})

export const deliveryDateSchema = z.object({
  date: dateSchema,
  description: z.string().min(1, 'Descrição é obrigatória').max(500),
  completed: z.boolean().optional(),
})

export const projectItemSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(500),
  quantity: z.number().int().min(1, 'Quantidade mínima é 1'),
  unit_price: positiveDecimalSchema,
  due_date: optionalDateSchema,
})

export const projectTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200).transform(s => s.trim()),
})

// ============================================
// PROPOSALS
// ============================================
export const createProposalSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  client_id: cuidSchema,
  description: z.string().max(2000).optional(),
})

export const updateProposalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  discount: z.number().min(0).max(100).optional(),
  valid_until: optionalDateSchema,
  cover_image: z.string().max(2000).optional(),
  primary_color: z.string().max(20).optional(),
  payment_date: optionalDateSchema,
  installments: z.number().int().min(1).max(120).optional(),
  is_recurring: z.boolean().optional(),
  paymentSchedule: z.array(z.object({
    description: z.string(),
    dueDate: z.string(),
    amount: z.number(),
    percentage: z.number(),
    order: z.number(),
    paid: z.boolean().optional(),
    paidAt: z.string().optional().nullable(),
  })).optional(),
})

export const proposalItemSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(500),
  quantity: z.number().int().min(1),
  unit_price: positiveDecimalSchema,
  date: optionalDateSchema,
  recording_date: optionalDateSchema,
  delivery_date: optionalDateSchema,
  show_dates: z.boolean().optional(),
})

export const proposalOptionalSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  price: positiveDecimalSchema,
  dependency: z.string().max(200).optional(),
})

export const proposalVideoSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  video_url: z.string().url('URL inválida').max(2000),
})

// ============================================
// CLIENTS
// ============================================
export const createClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  email: z.string().email('Email inválido').max(200).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

export const updateClientSchema = createClientSchema.partial()

// ============================================
// FREELANCERS
// ============================================
export const createFreelancerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  email: z.string().email('Email inválido').max(200).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  skills: z.string().max(500).optional().nullable(),
  daily_rate: positiveDecimalSchema.optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  pix_key: z.string().max(100).optional().nullable(),
  portfolio_url: z.string().url().max(2000).optional().nullable(),
})

export const updateFreelancerSchema = createFreelancerSchema.partial()

// ============================================
// EQUIPMENT
// ============================================
export const createEquipmentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  brand: z.string().max(100).optional().nullable(),
  model: z.string().max(100).optional().nullable(),
  category: z.enum(['CAMERA', 'LENS', 'AUDIO', 'LIGHTING', 'GRIP', 'DRONE', 'ACCESSORY', 'OTHER']),
  serial_number: z.string().max(100).optional().nullable(),
  status: z.enum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST']).optional(),
  notes: z.string().max(2000).optional().nullable(),
  purchase_date: optionalDateSchema,
  purchase_price: positiveDecimalSchema.optional().nullable(),
  daily_rate: positiveDecimalSchema.optional().nullable(),
  photo_url: z.string().url().max(2000).optional().nullable(),
})

export const updateEquipmentSchema = createEquipmentSchema.partial()

export const bookingSchema = z.object({
  projectId: cuidSchema,
  equipmentId: cuidSchema.optional(),
  kitId: cuidSchema.optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  returnDate: optionalDateSchema,
  notes: z.string().max(1000).optional(),
})

export const maintenanceLogSchema = z.object({
  equipmentId: cuidSchema,
  description: z.string().min(1, 'Descrição é obrigatória').max(1000),
  cost: positiveDecimalSchema.optional(),
  dateStart: dateSchema,
  dateEnd: optionalDateSchema,
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  technicianName: z.string().max(200).optional(),
  externalService: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  invoiceNumber: z.string().max(100).optional(),
})

// ============================================
// FINANCIAL
// ============================================
export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  category: z.string().min(1, 'Categoria é obrigatória').max(100),
  description: z.string().min(1, 'Descrição é obrigatória').max(500),
  amount: positiveDecimalSchema,
  estimated_amount: positiveDecimalSchema.optional(),
  status: z.enum(['PENDING', 'SCHEDULED', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  due_date: optionalDateSchema,
  payment_date: optionalDateSchema,
  payment_method: z.string().max(50).optional(),
  project_id: cuidSchema.optional(),
  proposal_id: cuidSchema.optional(),
  client_id: cuidSchema.optional(),
  freelancer_id: cuidSchema.optional(),
  equipment_id: cuidSchema.optional(),
  invoice_number: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  is_recurring: z.boolean().optional(),
  recurrence_period: z.enum(['MONTHLY', 'YEARLY', 'WEEKLY']).optional(),
})

export const expenseSchema = z.object({
  project_id: cuidSchema,
  category: z.enum(['CREW_TALENT', 'EQUIPMENT', 'LOGISTICS', 'FOOD', 'OTHER']),
  description: z.string().min(1, 'Descrição é obrigatória').max(500),
  estimated_cost: positiveDecimalSchema,
  actual_cost: positiveDecimalSchema.optional(),
  freelancer_id: cuidSchema.optional(),
  equipment_id: cuidSchema.optional(),
  payment_status: z.enum(['TO_PAY', 'SCHEDULED', 'PAID']).optional(),
  payment_date: optionalDateSchema,
  invoice_number: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
})

// ============================================
// CALENDAR
// ============================================
export const calendarEventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().max(2000).optional().nullable(),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().min(1, 'Data de fim é obrigatória'),
  all_day: z.boolean().optional(),
  type: z.string().max(50).optional(),
  project_id: cuidSchema.optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
})

// ============================================
// AUTH
// ============================================
export const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  companyName: z.string().min(1, 'Nome da empresa é obrigatório').max(200),
  whatsapp: z.string().max(30).optional(),
  capitalInicial: positiveDecimalSchema.optional(),
})

export const completeSetupSchema = z.object({
  companyName: z.string().min(1, 'Nome da empresa é obrigatório').max(200),
  whatsapp: z.string().max(30).optional(),
  capitalInicial: positiveDecimalSchema.optional(),
})

// ============================================
// SCRIPTS
// ============================================
export const createScriptSchema = z.object({
  project_id: cuidSchema.optional().nullable(),
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().max(2000).optional().nullable(),
  video_format: z.string().max(50).optional().nullable(),
  target_platform: z.string().max(100).optional().nullable(),
  target_audience: z.string().max(200).optional().nullable(),
  tone: z.string().max(100).optional().nullable(),
})

export const createSceneSchema = z.object({
  script_id: cuidSchema,
  order: z.number().int().min(1),
  title: z.string().max(200).optional(),
  duration: z.number().int().min(1).optional(),
  description: z.string().max(2000).optional().nullable(),
  action: z.string().max(2000).optional().nullable(),
  dialogue: z.string().max(5000).optional().nullable(),
  voiceover: z.string().max(5000).optional().nullable(),
  lettering: z.string().max(2000).optional().nullable(),
  sound_design: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  camera_angle: z.string().max(100).optional().nullable(),
  camera_movement: z.string().max(100).optional().nullable(),
  transition: z.string().max(100).optional().nullable(),
  location_note: z.string().max(500).optional().nullable(),
  equipment_notes: z.string().max(500).optional().nullable(),
})

// ============================================
// ASSIGNMENTS
// ============================================
export const addProjectMemberSchema = z.object({
  project_id: cuidSchema,
  freelancer_id: cuidSchema,
  role: z.string().min(1).max(100),
  agreed_fee: positiveDecimalSchema.optional(),
})

export const updateProjectMemberSchema = z.object({
  role: z.string().min(1).max(100).optional(),
  status: z.enum(['INVITED', 'CONFIRMED', 'DECLINED', 'CANCELLED']).optional(),
  agreed_fee: positiveDecimalSchema.optional(),
})

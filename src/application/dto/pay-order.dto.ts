import { IsEnum } from 'class-validator';

/** Objeto enum para validação do paymentMethod (PATCH orders/:id/pay). */
export const PaymentMethodEnum = {
  PIX: 'PIX',
  MONEY: 'MONEY',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
} as const;

export type PayOrderPaymentMethod = (typeof PaymentMethodEnum)[keyof typeof PaymentMethodEnum];

/**
 * DTO de entrada para fechar comanda (PATCH orders/:id/pay).
 * paymentMethod é obrigatório ao fechar.
 */
export class PayOrderDto {
  @IsEnum(PaymentMethodEnum, {
    message: 'paymentMethod deve ser um dos valores: PIX, MONEY, CREDIT_CARD, DEBIT_CARD',
  })
  paymentMethod!: PayOrderPaymentMethod;
}

-- SEED DATA PARA DEMONSTRAÇÃO E TESTES DO SEVEN DRIVE

-- Veículos de Exemplo
INSERT INTO public.vehicles (id, placa, renavam, marca, modelo, ano, cor, combustivel, chassi, km_inicial, km_atual, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'BRA2E19', '12345678901', 'Chevrolet', 'Onix 1.0 Flex', 2023, 'Branco', 'Flex', '9BGKS48V0PG123456', 32000, 39600, 'alugado'),
  ('22222222-2222-2222-2222-222222222222', 'RTY7A88', '98765432109', 'Hyundai', 'HB20 1.0 Sense', 2024, 'Prata', 'Flex', '9BHBA51C8RP987654', 15000, 23400, 'alugado'),
  ('33333333-3333-3333-3333-333333333333', 'KLO4H22', '55443322110', 'Fiat', 'Mobi 1.0 Like', 2023, 'Preto', 'Flex', '9BD157041P8554433', 45000, 48200, 'disponivel')
ON CONFLICT (placa) DO NOTHING;

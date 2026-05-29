CREATE OR REPLACE FUNCTION public.sync_apartment_on_order_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.apartment_id IS NOT NULL THEN
    UPDATE public.apartments SET status = 'sold' WHERE id = NEW.apartment_id;
  ELSIF OLD.status = 'completed' AND NEW.status <> 'completed' AND NEW.apartment_id IS NOT NULL THEN
    UPDATE public.apartments SET status = 'available' WHERE id = NEW.apartment_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_apartment_on_order_completed ON public.orders;
CREATE TRIGGER trg_sync_apartment_on_order_completed
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_apartment_on_order_completed();
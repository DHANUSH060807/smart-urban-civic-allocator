-- CivicFlow: Trigger Function for Issue Status Changes

CREATE OR REPLACE FUNCTION public.log_issue_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO status_history (
            issue_id,
            old_status,
            new_status,
            changed_by,
            changed_at,
            remarks
        )
        VALUES (
            NEW.issue_id,
            OLD.status,
            NEW.status,
            1,
            CURRENT_TIMESTAMP,
            'Status updated automatically by database trigger'
        );
    END IF;

    RETURN NEW;
END;
$function$;

-- Trigger : Issue Status Audit
CREATE TRIGGER issue_status_audit
AFTER UPDATE OF status ON issues
FOR EACH ROW
EXECUTE FUNCTION log_issue_status_change();



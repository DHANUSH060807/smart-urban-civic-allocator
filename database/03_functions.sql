
-- CivicFlow: Function to count issues by status

CREATE OR REPLACE FUNCTION public.get_issues_by_status(
    p_status character varying
)
RETURNS integer
LANGUAGE sql
AS $function$
    SELECT COUNT(*)::INTEGER
    FROM issues
    WHERE status = p_status;
$function$;

-- CivicFlow: Function to count issues by department

CREATE OR REPLACE FUNCTION public.get_department_issue_count(
    p_department_id integer
)
RETURNS integer
LANGUAGE plpgsql
AS $function$
DECLARE
    issue_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO issue_count
    FROM issues
    WHERE department_id = p_department_id;

    RETURN issue_count;
END;
$function$;
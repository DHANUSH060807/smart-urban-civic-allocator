-- CivicFlow: View combining issue and related details

CREATE OR REPLACE VIEW public.issue_details_view AS
SELECT
    i.issue_id,
    i.title,
    i.description,
    i.location,
    c.category_name,
    d.department_name,
    reporter.full_name AS reported_by_name,
    officer.full_name AS assigned_to_name,
    i.status,
    i.priority,
    i.created_at,
    i.updated_at
FROM issues i
LEFT JOIN categories c
    ON i.category_id = c.category_id
LEFT JOIN departments d
    ON i.department_id = d.department_id
LEFT JOIN users reporter
    ON i.reported_by = reporter.user_id
LEFT JOIN users officer
    ON i.assigned_to = officer.user_id;
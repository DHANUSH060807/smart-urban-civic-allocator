
-- CivicFlow: Resource Allocation Procedure

CREATE OR REPLACE PROCEDURE public.allocate_resource(
    IN p_issue_id integer,
    IN p_resource_id integer,
    IN p_allocated_by integer,
    IN p_quantity integer
)
LANGUAGE plpgsql
AS $procedure$
DECLARE
    v_available INT;
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be greater than zero';
    END IF;

    SELECT available_quantity
    INTO v_available
    FROM resources
    WHERE resource_id = p_resource_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resource not found';
    END IF;

    IF v_available < p_quantity THEN
        RAISE EXCEPTION 'Insufficient resources available';
    END IF;

    INSERT INTO allocations (
        issue_id, resource_id, allocated_by, quantity
    )
    VALUES (
        p_issue_id, p_resource_id, p_allocated_by, p_quantity
    );

    UPDATE resources
    SET available_quantity = available_quantity - p_quantity
    WHERE resource_id = p_resource_id;
END;
$procedure$;

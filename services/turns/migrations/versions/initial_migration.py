"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2023-01-01

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create turns table
    op.create_table(
        'turns',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('ticket_number', sa.String(length=10), nullable=False),
        sa.Column('branch_id', sa.Integer(), nullable=False),
        sa.Column('turn_type', sa.String(length=20), nullable=False),
        sa.Column('reason', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('customer_name', sa.String(length=100), nullable=True),
        sa.Column('customer_cedula', sa.String(length=20), nullable=True),
        sa.Column('customer_email', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('called_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('agent_id', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ticket_number')
    )


def downgrade() -> None:
    op.drop_table('turns')
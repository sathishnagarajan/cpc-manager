<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class UpdateEnquiriesTable extends Migration
{
    public function up()
    {
        // Add new fields to enquiries table
        $fields = [
            'enquiry_type' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => true,
                'after'      => 'enquiry_date',
                'comment'    => 'Type of enquiry: Back Pain, Neck Pain, Marketing, Career, etc.',
            ],
            'area' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => true,
                'after'      => 'enquiry_type',
                'comment'    => 'Chennai locality/area',
            ],
            'pincode' => [
                'type'       => 'VARCHAR',
                'constraint' => 10,
                'null'       => true,
                'after'      => 'area',
            ],
            'visit_type' => [
                'type'       => 'ENUM',
                'constraint' => ['clinic', 'home_visit'],
                'null'       => true,
                'after'      => 'pincode',
            ],
            'contact_method' => [
                'type'       => 'ENUM',
                'constraint' => ['phone', 'email', 'walk_in'],
                'null'       => true,
                'after'      => 'visit_type',
                'comment'    => 'How they contacted us',
            ],
            'converted_to_patient_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
                'null'       => true,
                'after'      => 'status',
                'comment'    => 'Patient ID if enquiry was converted',
            ],
            'conversion_date' => [
                'type' => 'DATE',
                'null' => true,
                'after' => 'converted_to_patient_id',
                'comment' => 'Date when enquiry was converted to patient',
            ],
        ];

        $this->forge->addColumn('enquiries', $fields);

        // Update status enum to include 'scheduled' and 'completed'
        $this->db->query("ALTER TABLE enquiries MODIFY status ENUM('new', 'contacted', 'scheduled', 'converted', 'cancelled', 'completed') DEFAULT 'new'");

        // Add index for converted_to_patient_id
        $this->forge->addKey('converted_to_patient_id', false, false, 'idx_converted_patient');
        
        // Add index for area for faster lookups
        $this->db->query("ALTER TABLE enquiries ADD INDEX idx_area (area)");
        
        // Add index for enquiry_type
        $this->db->query("ALTER TABLE enquiries ADD INDEX idx_enquiry_type (enquiry_type)");
    }

    public function down()
    {
        // Drop the added columns
        $this->forge->dropColumn('enquiries', [
            'enquiry_type',
            'area',
            'pincode',
            'visit_type',
            'contact_method',
            'converted_to_patient_id',
            'conversion_date',
        ]);

        // Revert status enum to original
        $this->db->query("ALTER TABLE enquiries MODIFY status ENUM('new', 'contacted', 'converted', 'cancelled') DEFAULT 'new'");
        
        // Drop indexes
        $this->db->query("ALTER TABLE enquiries DROP INDEX idx_area");
        $this->db->query("ALTER TABLE enquiries DROP INDEX idx_enquiry_type");
    }
}

<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class AreasSeeder extends Seeder
{
    public function run()
    {
        $data = [
            // North Chennai
            ['area' => 'Ambattur', 'pincode' => '600053'],
            ['area' => 'Ambattur Industrial Estate', 'pincode' => '600058'],
            ['area' => 'Avadi', 'pincode' => '600054'],
            ['area' => 'Aynavaram', 'pincode' => '600023'],
            ['area' => 'Ayanavaram', 'pincode' => '600023'],
            ['area' => 'Kolathur', 'pincode' => '600099'],
            ['area' => 'Korattur', 'pincode' => '600080'],
            ['area' => 'Madhavaram', 'pincode' => '600060'],
            ['area' => 'Manali', 'pincode' => '600068'],
            ['area' => 'Mogappair', 'pincode' => '600037'],
            ['area' => 'Mogappair East', 'pincode' => '600037'],
            ['area' => 'Mogappair West', 'pincode' => '600050'],
            ['area' => 'Perambur', 'pincode' => '600011'],
            ['area' => 'Puzhal', 'pincode' => '600066'],
            ['area' => 'Red Hills', 'pincode' => '600052'],
            ['area' => 'Tiruvottiyur', 'pincode' => '600019'],
            ['area' => 'Tondiarpet', 'pincode' => '600081'],
            ['area' => 'Washermanpet', 'pincode' => '600021'],
            
            // Central Chennai
            ['area' => 'Alandur', 'pincode' => '600016'],
            ['area' => 'Aminjikarai', 'pincode' => '600029'],
            ['area' => 'Anna Nagar', 'pincode' => '600040'],
            ['area' => 'Anna Nagar East', 'pincode' => '600102'],
            ['area' => 'Anna Nagar West', 'pincode' => '600040'],
            ['area' => 'Annanagar', 'pincode' => '600040'],
            ['area' => 'Arumbakkam', 'pincode' => '600106'],
            ['area' => 'Ashok Nagar', 'pincode' => '600083'],
            ['area' => 'Choolaimedu', 'pincode' => '600094'],
            ['area' => 'Chetpet', 'pincode' => '600031'],
            ['area' => 'Egmore', 'pincode' => '600008'],
            ['area' => 'Gopalapuram', 'pincode' => '600086'],
            ['area' => 'Kodambakkam', 'pincode' => '600024'],
            ['area' => 'Koyambedu', 'pincode' => '600107'],
            ['area' => 'Kilpauk', 'pincode' => '600010'],
            ['area' => 'Nungambakkam', 'pincode' => '600034'],
            ['area' => 'Saidapet', 'pincode' => '600015'],
            ['area' => 'T Nagar', 'pincode' => '600017'],
            ['area' => 'T. Nagar', 'pincode' => '600017'],
            ['area' => 'Teynampet', 'pincode' => '600018'],
            ['area' => 'Vadapalani', 'pincode' => '600026'],
            ['area' => 'Villivakkam', 'pincode' => '600049'],
            ['area' => 'Virugambakkam', 'pincode' => '600092'],
            
            // South Chennai
            ['area' => 'Adambakkam', 'pincode' => '600088'],
            ['area' => 'Adyar', 'pincode' => '600020'],
            ['area' => 'Alwarpet', 'pincode' => '600018'],
            ['area' => 'Besant Nagar', 'pincode' => '600090'],
            ['area' => 'Chitlapakkam', 'pincode' => '600064'],
            ['area' => 'Chromepet', 'pincode' => '600044'],
            ['area' => 'Ekkattuthangal', 'pincode' => '600032'],
            ['area' => 'Guindy', 'pincode' => '600032'],
            ['area' => 'Jafferkhanpet', 'pincode' => '600083'],
            ['area' => 'Keelkattalai', 'pincode' => '600117'],
            ['area' => 'Kotturpuram', 'pincode' => '600085'],
            ['area' => 'Madipakkam', 'pincode' => '600091'],
            ['area' => 'Mandaveli', 'pincode' => '600028'],
            ['area' => 'Medavakkam', 'pincode' => '600100'],
            ['area' => 'Meenambakkam', 'pincode' => '600027'],
            ['area' => 'Mylapore', 'pincode' => '600004'],
            ['area' => 'Nanganallur', 'pincode' => '600061'],
            ['area' => 'Pallavaram', 'pincode' => '600043'],
            ['area' => 'Pallikaranai', 'pincode' => '600100'],
            ['area' => 'Pammal', 'pincode' => '600075'],
            ['area' => 'Perungudi', 'pincode' => '600096'],
            ['area' => 'Palavakkam', 'pincode' => '600041'],
            ['area' => 'Selaiyur', 'pincode' => '600073'],
            ['area' => 'Sembakkam', 'pincode' => '600073'],
            ['area' => 'St. Thomas Mount', 'pincode' => '600016'],
            ['area' => 'Tambaram', 'pincode' => '600045'],
            ['area' => 'Tambaram East', 'pincode' => '600059'],
            ['area' => 'Thiruvanmiyur', 'pincode' => '600041'],
            ['area' => 'Tirusulam', 'pincode' => '600016'],
            ['area' => 'Velachery', 'pincode' => '600042'],
            
            // West Chennai
            ['area' => 'KK Nagar', 'pincode' => '600078'],
            ['area' => 'K.K. Nagar', 'pincode' => '600078'],
            ['area' => 'Kattupakkam', 'pincode' => '600056'],
            ['area' => 'Maduravoyal', 'pincode' => '600095'],
            ['area' => 'Mangadu', 'pincode' => '600122'],
            ['area' => 'Nandambakkam', 'pincode' => '600089'],
            ['area' => 'Nerkundram', 'pincode' => '600107'],
            ['area' => 'Porur', 'pincode' => '600116'],
            ['area' => 'Poonamallee', 'pincode' => '600056'],
            ['area' => 'Ramapuram', 'pincode' => '600089'],
            ['area' => 'Saligramam', 'pincode' => '600093'],
            ['area' => 'Valasaravakkam', 'pincode' => '600087'],
            
            // East Chennai - OMR
            ['area' => 'Egattur', 'pincode' => '603103'],
            ['area' => 'Injambakkam', 'pincode' => '600115'],
            ['area' => 'Karapakkam', 'pincode' => '600097'],
            ['area' => 'Kelambakkam', 'pincode' => '603103'],
            ['area' => 'Navalur', 'pincode' => '603103'],
            ['area' => 'Neelankarai', 'pincode' => '600041'],
            ['area' => 'Okkiyam Thoraipakkam', 'pincode' => '600097'],
            ['area' => 'Padur', 'pincode' => '603103'],
            ['area' => 'Perumbakkam', 'pincode' => '600100'],
            ['area' => 'Sholinganallur', 'pincode' => '600119'],
            ['area' => 'Siruseri', 'pincode' => '603103'],
            ['area' => 'Semmancheri', 'pincode' => '600119'],
            ['area' => 'Tharamani', 'pincode' => '600113'],
            ['area' => 'Thoraipakkam', 'pincode' => '600097'],
            ['area' => 'Taramani', 'pincode' => '600113'],
            
            // East Chennai - Other
            ['area' => 'Ennore', 'pincode' => '600057'],
            ['area' => 'Kathivakkam', 'pincode' => '600019'],
            ['area' => 'Minjur', 'pincode' => '601203'],
            
            // Outer Chennai
            ['area' => 'Chengalpattu', 'pincode' => '603001'],
            ['area' => 'Maraimalai Nagar', 'pincode' => '603209'],
            ['area' => 'Urapakkam', 'pincode' => '603210'],
            ['area' => 'Guduvancheri', 'pincode' => '603202'],
            ['area' => 'Vandalur', 'pincode' => '600048'],
        ];

        // Using batch insert for better performance
        $this->db->table('areas')->insertBatch($data);
        
        echo "Seeded " . count($data) . " areas successfully.\n";
    }
}

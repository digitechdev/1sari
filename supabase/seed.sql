BEGIN;

-- Section 4: Insert the initial data (seed data)
-- Note: Ensure data types match the table definition. Empty strings "" from CSV are represented as NULL.
-- Note: Duplicate rows from the original data are included here. Add constraints or clean data if uniqueness is required.
-- Note: The last row from the user prompt ('Marissa Rucio Coronel') was incomplete and is omitted here.
INSERT INTO public.account_information (
    name_of_borrower, provider_subject_no, gender, civil_status, type_of_id,
    birthday_borrower, age, mothers_maiden_name_borrower, name_of_co_borrower_maker,
    security_collateral, mode_of_payment, store_name, residence_address,
    length_of_stay_in_residence, store_address, area, contact_no_borrower,
    classification, store_category, account_relationship_officer, retail_partner
) VALUES
('Arlene Andaya Corook', 'CL-00207', 'F', 'Single', NULL, NULL, NULL, NULL, 'Donald Salvador Aguillon', 'Post Dated Checks', 'Gcash', 'D.S.A. Sari Sari Store', NULL, NULL, 'B16 L3  KMC Residences 2  Sugar Road  Mabuhay Calamba Cavite', 'Cavite', '9612585710', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Edwin Lopez Mercado', 'CL-00207', 'M', 'Married', NULL, NULL, NULL, NULL, 'Elena Rimando Mercado', 'Post Dated Checks', 'Check Deposit', 'Five (5) Commercial Space - E.L. Mercado', NULL, NULL, 'B21 L4 & 6 PH-3    Greengate Homes Subd.  Malagasang II-A Imus Cavite', 'Cavite', '9273820265', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Jenalyn Santiago Dy', 'CL-00185', 'M', 'Married', NULL, NULL, NULL, NULL, 'Raymond Tolentino Dy', 'Post Dated Checks', 'Gcash', 'Jenalyn Store', NULL, NULL, '846  Purok-3  Brgy. Sto. Niño    San Pablo Laguna', 'Laguna', '9926001243', 'Tier 2', 'Wholesale Trade', 'None', 'N/A'),
('Ronniel Avila Seramines', 'CL-00186', 'M', 'Single', NULL, NULL, NULL, NULL, 'N/A', 'Post Dated Checks', 'Check Deposit', 'Global League of United Organization (GLUO) Marketing Cooperative', NULL, NULL, 'Blk 19 Lot 35 PH 1  Red Heart St.  Green Borough Subd.  Sabang  Dasmariñas Cavite', 'Cavite', '9992278673', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Rufina Ilao Esteleydes', 'CL-00187', 'F', 'Single', NULL, NULL, NULL, NULL, 'Melinda Amores Gutierrez', 'Post Dated Checks', 'Check Deposit', 'Gre-Tel and Co-Len Pharmacy and General Merchandise', NULL, NULL, 'B2 L19 PH 8  Golden City Brgy. Salawag  Dasmariñas Cavite', 'Cavite', '9064536437', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Nenita Garcia Caballero', 'CL-00188', 'F', 'Married', NULL, NULL, NULL, NULL, 'Menandro Domingo Caballero', 'None', 'Gcash', 'GLM Sari Sari Store', NULL, NULL, ' L4 B1 Lhinette Homes    Brgy. Biga Tanza Cavite', 'Cavite', '9502346467', 'Tier 2', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Flordeliza Gerna Manguilimotan', 'CL-00189', 'F', 'Married', NULL, NULL, NULL, NULL, 'N/A', 'Post Dated Checks', 'Gcash', 'Angel''s ParesPares Food House', NULL, NULL, '4143-A    Zaragoza Compound  Palico IV  Imus Cavite', 'Cavite', '9950276601', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Rosalyn Cruz Torres', 'CL-00190', 'F', 'Married', NULL, NULL, NULL, NULL, 'None', 'Post Dated Checks', 'Check Deposit', 'RTTEL TRADING', NULL, NULL, 'No. 9 Cardinal  St. Saint Dominic  1 Subdivision  Brgy. Bahay Toro  Quezon City NCR', 'NCR', '9063371617', 'Tier 1', 'Wholesale Trade', 'None', 'N/A'),
('Lea Argosino Quito', 'CL-00191', 'F', 'Single', NULL, NULL, NULL, NULL, 'Odelon Gocoyo Manallo', 'Post Dated Checks', 'Gcash', 'Ody and Lea Eatery', NULL, NULL, 'B18 L4    Sugar Road  City Land Mabuhay  Carmona  Cavite', 'Cavite', '9464455055', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Jeremiah Campos Castillo', 'CL-00192', 'F', 'Married', NULL, NULL, NULL, NULL, 'Kathelyn Pascua Castillo', 'Post Dated Checks', 'Gcash', 'Kathelyn RTW Shop', NULL, NULL, 'Blk 6 Lot 12  Candido Ramos  Drive Golden Acres Subd.  Talon 1  Las Piñas City NCR', 'NCR', '9205245948', 'Tier 1', 'Wholesale Trade', 'None', 'N/A'),
('Admer Saplaan Guquib', 'CL-00193', 'M', 'Single', NULL, NULL, NULL, NULL, 'Orpha Saplaan Pascua', 'Post Dated Checks', 'Gcash', 'Kissy Footwear Store', NULL, NULL, 'Blk 7 Lot 11  Candido Ramos  Drive Golden Acres    Talon 1 Las Piñas City NCR', 'NCR', '9617180069', 'Tier 1', 'Wholesale Trade', 'None', 'N/A'),
('Rowen Dela Cruz Encio', 'CL-00194', 'M', 'Single', NULL, NULL, NULL, NULL, 'Jenille Reyes Torres', 'Post Dated Checks', 'Check Deposit', 'Lyren Sari Sari Store', NULL, NULL, '      GMA, Cavite Cavite', 'Cavite', '9669367799', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Jessie Torres Docto', 'CL-00195', 'M', 'Married', NULL, NULL, NULL, NULL, 'Jonah Tejemo Docto', 'Post Dated Checks', 'UB Bank Transfer', 'Docto Fruit and Vegetable Trading', NULL, NULL, ' B41 L1    Greengate Homes  Malagasang II-B  Imus Cavite', 'Cavite', '9951046321', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Pacifico Malala Talibutab', 'CL-00196', 'M', 'Married', NULL, NULL, NULL, NULL, 'Ofelia Labong Talibutab', 'Post Dated Checks', 'Check Deposit', 'JGM Hardware', NULL, NULL, 'Blk 76    Congressional Ave.  Brgy. San Esteban    Dasmariñas  Cavite', 'Cavite', '9159567405', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Marivic Bernabe Zapanta', 'CL-00197', 'F', 'Married', NULL, NULL, NULL, NULL, 'Roerl Papa Zapanta', 'Post Dated Checks', 'Check Deposit', 'Maxicare Pharmacy', NULL, NULL, 'Unit 11    Cellar Mansion J M Loyola St.  Maduya  Carmona  Cavite', 'Cavite', '9173142411', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Marigrace Angeles Felicia', 'CL-00198', 'F', 'Single', NULL, NULL, NULL, NULL, 'None', 'Painting (COA)', 'Check Deposit', 'Go Direct Enterprise', NULL, NULL, '51 West Capitol Drive  Kapitolyo  Pasig City NCR', 'NCR', '09178157370', 'Tier 1', 'Wholesale Trade', 'None', 'N/A'),
('Benzon Lovendino Mapusao', 'CL-00199', 'M', 'Married', NULL, NULL, NULL, NULL, 'N/A', 'Post Dated Checks', 'Check Deposit', 'Laos Sari Sari Store', NULL, NULL, 'Blk 28 Lot 6  Laos St.  San Marino  3 Salawag Dasmariñas Cavite', 'Cavite', '9394613099', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('James Esquerra Mazo', 'CL-00200', 'M', 'Married', NULL, NULL, NULL, NULL, 'Laura Roldan Mazo', 'Post Dated Checks', 'Check Deposit', 'Mazo Star Gaz Express', NULL, NULL, '137  Tamsui Avenue  Bayan Luma III Imus Cavite', 'Cavite', '9328820200', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Janice Dagonio Marange', 'CL-00201', 'F', 'Married', NULL, NULL, NULL, NULL, 'Chito Pacleb Chao', 'None', 'UB Bank Transfer', 'Chao Variety Store', NULL, NULL, 'B15 L9 PH3      Greengate Homes Malagasang II-A Imus Cavite', 'Cavite', '9423792158', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Katherine Joy Matabang Lim', 'CL-00204', 'F', 'Married', NULL, NULL, NULL, NULL, 'Christoper Umerez Lim', 'Post Dated Checks', 'Check Deposit', 'C. Lim Sari-Sari Store', NULL, NULL, 'Blk 112 Lot 4    Paliparan 3 Phase 3    Dasmariñas  Cavite', 'Cavite', '9453575703', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Kristine Yvonne Torrero Guarino', 'CL-00208', 'F', 'Single', NULL, NULL, NULL, NULL, 'Joan Mabilog Mesa', 'Post Dated Checks', 'Check Deposit', 'Kinder Love Sari Sari Store', NULL, NULL, 'L1 B1 P1 S9    Pabahay Bagtas Bagtas Tanza Cavite', 'Cavite', '9481779735', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Roderic Maala Bathan', 'CL-00210', 'F', 'Married', NULL, NULL, NULL, NULL, 'Rizza Villegas Bathan', 'Post Dated Checks', 'Check Deposit', 'RM Bathan Sari Sari Store', NULL, NULL, 'Blk 28 lot 5 ph 2    Green gate Homes  Malagasang II B  Imus Cavite', 'Cavite', '9151710758', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Nerilyn Panganiban Pasia', 'CL-00211', 'F', 'Married', NULL, NULL, NULL, NULL, 'Renato Aspre Pasia Jr.', 'None', 'Gcash', 'Nerie''s Store', NULL, NULL, '54 Purok 2    Brgy. Sala  Balete Batangas', 'Batangas', '9471872010', 'Tier 1', 'Wholesale Trade', 'Paris Troy Fernandez', 'N/A'),
('Jovanie Bandejas Visto', 'CL-00213', 'M', 'Married', NULL, NULL, NULL, NULL, 'None', 'None', 'BDO Bank Transfer', 'Jovanie Junkshop', NULL, NULL, '9005 Nia Road    Bucandala III Imus Cavite', 'Cavite', '9217889891', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Yurica Jinky Buenviaje Derada', 'CL-00214', 'F', 'Married', NULL, NULL, NULL, NULL, 'Rosalito Rosaria Derada', 'Post Dated Checks', 'Gcash', 'Yurice Variety Store', NULL, NULL, 'Purok 1  San Pedro  Rosario Bldg.  Brgy. Lapidario  Trece Martires  Cavite', 'Cavite', '9913972415', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Kristine Ireneo Noche', 'CL-00215', 'F', 'Single', NULL, NULL, NULL, NULL, 'Ericson Bague Layag', 'None', 'Gcash', 'E and K Motorcycle and Accessories', NULL, NULL, '    Poblacion 12 Taal Batangas', 'Batangas', '9997782129', 'Tier 2', 'Wholesale Trade', 'Joseph Francisco', 'N/A'),
('Medelyn Noquil Vivas', 'CL-00216', 'F', 'Married', NULL, NULL, NULL, NULL, 'Felix Magpantay Vivas', 'Post Dated Checks', 'Gcash', 'MOM''S WAY BAKERY SUPPLIES SHOP', NULL, NULL, '218  A. Mabini Avenue Brgy. Pablacion 2 Tanauan Batangas', 'Batangas', '9770140399', 'Tier 1', 'Wholesale Trade', 'Joseph Francisco', 'N/A'),
('Loreto Rellis Palomares', 'CL-00217', 'M', 'Married', NULL, NULL, NULL, NULL, 'Flordeliz Anadon Palomares', 'None', 'Gcash/BDO Bank Transfer', 'Loreto Rellis Palomares Srore', NULL, NULL, ' Blk 10 Lot 46    Platinumville Barium St.  San Nicolas III  Bacoor Cavite', 'Cavite', '9062296087', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Anacito Brani Cando', 'CL-00218', 'M', 'Single', NULL, NULL, NULL, NULL, 'Richie Espiritu Torres', 'ORCR', 'Gcash', 'Cando Sari Sari Store', NULL, NULL, 'Blk 28 Lot 8  Meadowood Executive Village  Panapaan VIII Bacoor Cavite', 'Cavite', '9499354533', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Melanie Tomale Sayawan', 'CL-00219', 'F', 'Single', NULL, NULL, NULL, NULL, 'Nilo Gonzales Lopez', 'Post Dated Checks', 'Check Deposit', 'Zenhan Accounting Services', NULL, NULL, 'Blk 17A Lot 12  Mt. Apo St.  Terra Alta Homes Paliparan    Dasmariñas Cavite', 'Cavite', '9424718640', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Eliza Ceñidoza Reyes', 'CL-00220', 'F', NULL, NULL, NULL, NULL, NULL, 'N/A', 'Post Dated Checks', 'Check Deposit', 'Lhai-Rence Food Stall', NULL, NULL, 'Blk 3 Lot 6 Cluster 1 Phase 2    Town and Country Subd.  Salitran IV    Dasmariñas Cavite', 'Cavite', '9171084240', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Edilberto Olitres Sagnoy', 'CL-00221', 'M', NULL, NULL, NULL, NULL, NULL, 'N/A', 'Post Dated Checks', 'Check Deposit', 'Jerwil Hardware & Construction Supply', NULL, NULL, 'Blk 13 Lot 1  Legian Subd. Bucandala III Imus Cavite', 'Cavite', '9056441032', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Elnard Alden Soriano Tamina', 'CL-00223', 'M', 'Married', NULL, NULL, NULL, NULL, 'Cindy Liwanag Tamina', 'Post Dated Checks', 'Check Deposit', 'Elnard Alden Trading', NULL, NULL, '    Public Market Lewin  Lumban Laguna', 'Laguna', '9175151886', 'Tier 1', 'Wholesale Trade', 'taken over by Tomy', 'N/A'),
('Grace Mangurali Lolong', 'CL-00224', 'F', 'Married', NULL, NULL, NULL, NULL, 'Geronimo Liwag Mangurali', 'Post Dated Checks', 'Check Deposit', 'G.M. Metal Craft & Spark Plus Factory', NULL, NULL, '230    Sitio Centro  Cawongan Padre Garcia Batangas', 'Batangas', '9451330960', 'Tier 1', 'Wholesale Trade', 'John Rey Garbin', 'N/A'),
('Rosanna Heraldo Carcido', 'CL-00225', 'F', 'Single', NULL, NULL, NULL, NULL, 'Theodore Reyeg Sampilo', 'Post Dated Checks', 'Gcash', 'SADAQA FERTILIZER SERVICES', NULL, NULL, 'Purok 3    Malaking Ambling  Magdalena Laguna', 'Laguna', '9662151331', 'Tier 2', 'Wholesale Trade', 'Mariel Pattaguan', 'N/A'),
('Denis Lumawag Del Rosario', 'CL-00226', 'M', 'Married', NULL, NULL, NULL, NULL, 'Jonalyn Dalumpines Del Rosario', 'Post Dated Checks', 'Gcash', 'DLDJ PC Computer Parts and Accesories Shop', NULL, NULL, 'B27 L25    Greengate Homes Subd.  Malagasang II-A Imus Cavite', 'Cavite', '9568506047', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Edwin Arellano Morata', 'CL-00227', 'M', 'Married', NULL, NULL, NULL, NULL, 'Josie Samonte Morata', 'None', 'Gcash', '3JJ Sari- Sari Store', NULL, NULL, '9021 Evangelista St.    Muzon II  Rosario Cavite', 'Cavite', '09971956648/09754409938', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Michael Espinosa Miranda', 'CL-00228', NULL, NULL, NULL, NULL, NULL, NULL, 'N/A', 'Post Dated Checks', 'Gcash', 'Michael Sari-Sari Store', NULL, NULL, ' Door G Norjo Commercial Burol 1  Dasmariñas Cavite', 'Cavite', '9659049520', 'Tier 1', 'Sari-Sari Store', 'John Florentino Miraya', 'N/A'),
('Peter Daniel Martin Veriña', 'CL-00229', 'M', NULL, NULL, NULL, NULL, NULL, 'N/A', 'Post Dated Checks', 'Check Deposit', 'Finestmedia Multimedia Production', NULL, NULL, ' Blk 25 Lot 10  University Hills Estate  Sampaloc IV  Dasmariñas Cavite', 'Cavite', '9266396343', 'Tier 1', 'Multimedia Production', 'John Florentino Miraya', 'N/A'),
('Lugena Magsayo Ancajas', 'CL-00230', 'F', 'Married', NULL, NULL, NULL, NULL, 'Jessie Avorque Ancajas', 'None', 'BDO Bank Transfer', 'Double B Junk Shop', NULL, NULL, 'Blk 14 Lot 58 St. Anthony Village    Brgy. Salitran III Dasmariñas Cavite', 'Cavite', '9309178883', 'Tier 1', 'Junk Shop', 'John Florentino Miraya', 'N/A'),
('Mary Ann Martinez Carvajal', 'CL-00231', 'F', NULL, NULL, NULL, NULL, NULL, 'N/A', 'None', 'Check Deposit', 'D''Regemist Trading', NULL, NULL, 'Blk 24, Lot 2  Southcrest  San Agustine 2 Dasmarinas Cavite', 'Cavite', '9338105453', 'Tier 1', 'Retailer Sale of Hardware', 'John Florentino Miraya', 'N/A'),
('Mercedita Palca Napoles', 'CL-00232', 'F', 'Married', NULL, NULL, NULL, NULL, 'Godwen Quilisadio Napoles', 'None', 'BDO Bank Transfer', 'M. Palca Trading', NULL, NULL, 'Blk 1 Lot 8 PH-1  Windward Hills Village  Burol I  Dasmarinas Cavite', 'Cavite', '9088621087', 'Tier 1', 'Trading', 'John Florentino Miraya', 'N/A'),
('Normina Sabtola Jaway', 'CL-00233', 'F', 'Married', NULL, NULL, NULL, NULL, 'Ronelo Verin Jaway', 'None', 'Gcash', 'Chin-Chin Store', NULL, NULL, 'Kanto Bagtas      Brgy. Bagtas  Tanza  Cavite', 'Cavite', '9053045083', 'Tier 1', 'Mini Grocery', 'John Florentino Miraya', 'N/A'),
('Samuel Sibayan Rimando', 'CL-00237', 'M', 'Married', NULL, NULL, NULL, NULL, 'Melody Melo Rimando', 'None', 'Gcash', 'One4Eleven Store', NULL, NULL, 'Block 80 Lot 42  Golden Horizon Homes Barangay Hugo Perez Trece Martires Cavite', 'Cavite', '9695423742', 'Tier 2', 'Sari-Sari Store', 'John Florentino Miraya', 'N/A'),
('Corazon Regiro Jalandoni', 'CL-00240', 'F', 'Married', NULL, NULL, NULL, NULL, 'Els Jhosua Regiro Jalandoni', 'Post Dated Checks', 'Check Deposit', 'RCJJ Fish Stall', NULL, NULL, 'E10 E59 F7 F8 F53 54 55  Wet Section  SM Market Mall  Burol I    Dasmariñas  Cavite', 'Cavite', '9392808167', 'Tier 1', 'Fish Stall', 'John Florentino Miraya', 'N/A'),
('Juanito Naul Malayan', 'CL-00241', 'M', 'Married', NULL, NULL, NULL, NULL, 'Marjorie Sta.Maria Malayan', 'Post Dated Checks', 'Check Deposit', 'Juanito Malayan Junkshop', NULL, NULL, ' Malagasang Alapan Bucandala Road  Alapan II-B  Imus Cavite', 'Cavite', '9087578087', 'Tier 1', 'Junk Shop', 'John Florentino Miraya', 'N/A'),
('Junry Cartagena Gallaza', 'CL-00242', 'M', 'Married', NULL, NULL, NULL, NULL, 'Evelyn Pacaonces Gallaza', 'Post Dated Checks', 'BDO Bank Transfer', 'BryMarkGil Banana Store', NULL, NULL, '32 Commercial Space  Jose Abad Santos Salawag Dasmarinas Cavite', 'Cavite', '9955364543', 'Tier 1', 'Retailer Banana', 'John Florentino Miraya', 'N/A'),
('Govind Kishu Daswani', 'CL-00244', 'M', 'Single', NULL, NULL, NULL, NULL, 'None', 'Post Dated Checks/REM', 'Check Deposit', 'Kindercare Baby', NULL, NULL, 'Unit3203,32nd Flr,North Tower,Joya Lofts Towers Plaza Drive,Rockwell Center  Makati (Rockwell) NCR', 'NCR', '9189283650', 'Tier 1', 'Wholesale Distributor of Baby Products', 'None', 'N/A'),
('Irene De Asis Dando', 'CL-00250', 'F', 'Single', NULL, NULL, NULL, NULL, 'Jessie Bautista Pillerva', 'Post Dated Checks', 'Check Deposit', 'Lexrene Rice and Feeds Retailing', NULL, NULL, 'Purok 3    Brgy. Santol  Tanza Cavite', 'Cavite', '9656834043', 'Tier 2', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Janet Laspoña Villahermosa', 'CL-00251', 'F', 'Single', NULL, NULL, NULL, NULL, 'Alma Villahermosa Vidas', 'Post Dated Checks', 'Check Deposit', 'JAVS Glass and Aluminum  Services', NULL, NULL, 'Blk 16 Lot A  Everlasting St. Queen''s Row West Area B  Bacoor Cavite', 'Cavite', '9776380338', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Marites Untalan Caig', 'CL-00252', 'F', 'Single', NULL, NULL, NULL, NULL, 'None', 'None', 'BDO Bank Transfer', 'Trisha Sari Sari Store', NULL, NULL, 'B21 L55    Mistral Plains Subivision Brgy. San Francisco Gen Tri Cavite', 'Cavite', '9955082308', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Mari June Dela Cruz Funtilar', 'CL-00253', 'F', 'Single', NULL, NULL, NULL, NULL, 'Joseph Doma Funtilar', 'Post Dated Checks', 'Check Deposit', 'Marijune Sari-Sari Store', NULL, NULL, '47 Malihan St. Zone IV  Dasmariñas Cavite Cavite', 'Cavite', '9955082308', 'Tier 1', 'Wholesale Trade', 'John Florentino Miraya', 'N/A'),
('Darwin Buan Pacio', 'CL-00261', 'M', NULL, NULL, NULL, NULL, NULL, 'N/A', 'Post Dated Checks', 'Check Deposit', 'Tapsiwin and Pares Hub', NULL, NULL, ' Blk 3 Lot 9 / Blk 3 Lot 17    Brgy. Sta. Fe Dasmariñas  Cavite', 'Cavite', '9268103754', 'Tier 1', 'Food Services', 'John Florentino Miraya', 'N/A');

-- Section 2: Insert sample loan data based on loan.interfaces.ts
-- Assuming account_information IDs are generated sequentially starting from 1
-- Using CURRENT_DATE for dates, adjust as needed
INSERT INTO public.loans (
    borrower_id, co_borrower_id, co_maker_id, store_name, 
    principal, interest_rate, term_in_months, value_date, calculation_type, repayment_frequency, 
    status, application_date, approval_date, purpose, notes
) VALUES
-- Loan 1 for Arlene Andaya Corook (borrower_id = 1)
(1, NULL, NULL, 'D.S.A. Sari Sari Store', 
 30000.00, 0.03, 2, '2025-03-01', 'straight', 'daily', 
 'Active', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '1 day', 'Working Capital', 'Sample straight daily loan'
),
-- Loan 2 for Edwin Lopez Mercado (borrower_id = 2)
(2, NULL, NULL, 'Five (5) Commercial Space - E.L. Mercado', 
 100000.00, 0.03, 6, '2025-03-01', 'diminishing', 'monthly', 
 'Active', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '3 days', 'Store Expansion', 'Sample diminishing monthly loan'
),
-- Loan 3 for Jenalyn Santiago Dy (borrower_id = 3)
(3, NULL, NULL, 'Jenalyn Store', 
 50000.00, 0.025, 12, CURRENT_DATE, 'diminishing', 'monthly', 
 'Pending', CURRENT_DATE, NULL, 'Inventory Purchase', 'Sample pending loan'
);

-- Section 3: Insert sample loan payment schedule data based on loan-payment-schedule.interfaces.ts
-- Assuming loan IDs are generated sequentially starting from 1 (matching the inserts above)
-- Placeholder amounts used for principal_paid, interest_paid, outstanding_balance - these should be calculated realistically

-- Schedule for Loan 1 (ID=1, Straight Daily, 60 days)
-- Only showing first few days for brevity
INSERT INTO public.loan_payment_schedules (
    loan_id, period_number, due_date, amount_due, principal_paid, interest_paid, outstanding_balance, status
) VALUES
(1, 1, '2025-03-02', 530.00, 500.00, 30.00, 29500.00, 'Pending'),
(1, 2, '2025-03-03', 530.00, 500.00, 30.00, 29000.00, 'Pending'),
(1, 3, '2025-03-04', 530.00, 500.00, 30.00, 28500.00, 'Pending'),
(1, 4, '2025-03-05', 530.00, 500.00, 30.00, 28000.00, 'Pending'),
(1, 5, '2025-03-06', 530.00, 500.00, 30.00, 27500.00, 'Pending');
-- ... Add rows for all 60 days if seeding completely

-- Schedule for Loan 2 (ID=2, Diminishing Monthly, 6 months)
-- Using placeholder calculated values
INSERT INTO public.loan_payment_schedules (
    loan_id, period_number, due_date, amount_due, principal_paid, interest_paid, outstanding_balance, status
) VALUES
(2, 1, '2025-03-31', 18459.75, 15459.75, 3000.00, 84540.25, 'Pending'), 
(2, 2, '2025-04-30', 18459.75, 15923.54, 2536.21, 68616.71, 'Pending'),
(2, 3, '2025-05-31', 18459.75, 16401.25, 2058.50, 52215.46, 'Pending'),
(2, 4, '2025-06-30', 18459.75, 16893.29, 1566.46, 35322.17, 'Pending'),
(2, 5, '2025-07-31', 18459.75, 17400.08, 1059.67, 17922.09, 'Pending'),
(2, 6, '2025-08-31', 18459.75, 17922.09, 537.66, 0.00, 'Pending');

-- Schedule for Loan 3 (ID=3, Diminishing Monthly, 12 months) 
-- Only showing first few months for brevity
-- Placeholder values
INSERT INTO public.loan_payment_schedules (
    loan_id, period_number, due_date, amount_due, principal_paid, interest_paid, outstanding_balance, status
) VALUES
(3, 1, (CURRENT_DATE + INTERVAL '1 month')::date, 4757.80, 3507.80, 1250.00, 46492.20, 'Pending'),
(3, 2, (CURRENT_DATE + INTERVAL '2 month')::date, 4757.80, 3595.50, 1162.30, 42896.70, 'Pending'),
(3, 3, (CURRENT_DATE + INTERVAL '3 month')::date, 4757.80, 3685.38, 1072.42, 39211.32, 'Pending');
-- ... Add rows for all 12 months if seeding completely

COMMIT; 
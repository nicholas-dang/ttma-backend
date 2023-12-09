/* Replace with your SQL commands */
-- Create UserLogin table
CREATE TABLE UserLogin (
  UserID INT AUTO_INCREMENT PRIMARY KEY,
  Password VARCHAR(100),
  Email VARCHAR(100)
);

-- Create OTPAuth table
CREATE TABLE OTPAuth (
  OtpID INT AUTO_INCREMENT PRIMARY KEY,
  Email VARCHAR(100),
  OTP VARCHAR(100),
  ExpiryDate DATETIME
);

-- Create UserDetails table
CREATE TABLE UserDetails (
  UserID INT AUTO_INCREMENT PRIMARY KEY,
  FirstName VARCHAR(50),
  LastName VARCHAR(50),
  Address VARCHAR(200),
  PhoneNo VARCHAR(20),
  FOREIGN KEY (UserID) REFERENCES UserLogin(UserID)
);

-- Create FinancialYear table
CREATE TABLE FinancialYear (
  YearID INT PRIMARY KEY,
  Name VARCHAR(50),
  YearStart DATE,
  YearEnd DATE
);

-- Create FilesImages table
CREATE TABLE FilesImages (
  FileID INT AUTO_INCREMENT PRIMARY KEY,
  FileName VARCHAR(255),
  Type VARCHAR(50),
  Date DATE,
  FileLocation VARCHAR(255)
);

-- Create CapitalGainLoss table
CREATE TABLE CapitalGainLoss (
  GainLossID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT,
  Asset VARCHAR(100),
  Buy DECIMAL(10, 2),
  Sell DECIMAL(10, 2),
  Calc DECIMAL(10, 2),
  Date DATE,
  YearID INT,
  FOREIGN KEY (UserID) REFERENCES UserDetails(UserID),
  FOREIGN KEY (YearID) REFERENCES FinancialYear(YearID)
);

-- Create TaxDeductionsExpenses table
CREATE TABLE TaxDeductionsExpenses (
  TaxID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT,
  Type VARCHAR(50),
  Amount DECIMAL(10, 2),    
  Date DATE,
  Description TEXT NULL,
  YearID INT,
  FOREIGN KEY (UserID) REFERENCES UserDetails(UserID),
  FOREIGN KEY (YearID) REFERENCES FinancialYear(YearID)
);

-- Create AdditionalIncome table
CREATE TABLE AdditionalIncome (
  IncomeID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT,
  Title VARCHAR(50),
  Amount DECIMAL(10, 2),
  Date DATE,
  Description TEXT NULL,
  YearID INT,
  FOREIGN KEY (UserID) REFERENCES UserDetails(UserID),
  FOREIGN KEY (YearID) REFERENCES FinancialYear(YearID)
);

-- Create Donations table
CREATE TABLE Donations (
  DonationID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT,
  Organization VARCHAR(100),
  Amount DECIMAL(10, 2),
  Date DATE,
  YearID INT,
  FOREIGN KEY (UserID) REFERENCES UserDetails(UserID),
  FOREIGN KEY (YearID) REFERENCES FinancialYear(YearID)
);

-- Create TaxFiles table
CREATE TABLE TaxFiles (
	TaxFileID INT AUTO_INCREMENT PRIMARY KEY,
    TaxID INT,
    FileID INT,
    FOREIGN KEY (TaxID) REFERENCES TaxDeductionsExpenses(TaxID),
    FOREIGN KEY (FileID) REFERENCES FilesImages(FileID) ON DELETE CASCADE
);

-- Create IncomeFiles table
CREATE TABLE IncomeFiles (
	IncomeFileID INT AUTO_INCREMENT PRIMARY KEY,
    IncomeID INT,
    FileID INT,
    FOREIGN KEY (IncomeID) REFERENCES AdditionalIncome(IncomeID),
    FOREIGN KEY (FileID) REFERENCES FilesImages(FileID) ON DELETE CASCADE
);

-- Create DonationFiles table
CREATE TABLE DonationFiles (
	DonationFileID INT AUTO_INCREMENT PRIMARY KEY,
    DonationID INT,
    FileID INT,
    FOREIGN KEY (DonationID) REFERENCES Donations(DonationID),
    FOREIGN KEY (FileID) REFERENCES FilesImages(FileID) ON DELETE CASCADE
);
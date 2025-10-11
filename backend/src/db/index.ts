import mongoose from "mongoose";
mongoose.connect(
  `mongodb+srv://pavelx16_db_user:HIUNBcZt441ICgbY@packly-cluster0.ecsamh6.mongodb.net/palacios?retryWrites=true&w=majority&appName=Cluster0`
 
);
console.log("Mongo DB Connection Successful ");

export default mongoose;

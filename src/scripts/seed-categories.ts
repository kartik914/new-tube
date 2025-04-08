import db from "@/lib/db";

const categoryNames = [
  "Cars and Vehicles",
  "Comedy",
  "Education",
  "Gaming",
  "Entertainment",
  "Film and Animation",
  "How-to and Style",
  "Music",
  "News and Politics",
  "People and Blogs",
  "Pets and Animals",
  "Science and Technology",
  "Sports",
  "Travel and Events",
];

async function main() {
  try {

    const values = categoryNames.map((name) => ({ name, description: `Videos related to ${name.toLowerCase()}` }));
    await db.category.createMany({
      data: values,
    });

    console.log("Categories seeded");
  } catch (error) {
    console.error("Error seeding categories", error);
    process.exit(1);
  }
}

main();
